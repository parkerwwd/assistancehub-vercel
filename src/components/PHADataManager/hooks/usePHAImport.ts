
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Enhanced CSV parsing with better security validation
  const parseCSV = (csvText: string) => {
    // Security: Limit file size to prevent DoS attacks
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit
    if (csvText.length > maxFileSize) {
      throw new Error('File size too large. Maximum allowed size is 50MB.');
    }

    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Security: Limit number of records to prevent resource exhaustion
    const maxRecords = 100000; // 100k records limit
    if (lines.length > maxRecords) {
      throw new Error(`Too many records. Maximum allowed is ${maxRecords.toLocaleString()} records.`);
    }

    console.log('Total lines in CSV:', lines.length);
    console.log('First line (headers):', lines[0]);
    
    // Try to detect delimiter (tab or comma)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    console.log('Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
    
    // Parse headers with sanitization
    const headers = firstLine.split(delimiter).map(h => {
      const sanitized = h.trim().replace(/"/g, '').replace(/[<>]/g, ''); // Basic XSS prevention
      return sanitized.substring(0, 100); // Limit header length
    });
    console.log('Headers found:', headers);
    
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(delimiter).map(v => {
          const sanitized = v.trim().replace(/"/g, '').replace(/[<>]/g, ''); // Basic XSS prevention
          return sanitized.substring(0, 500); // Limit field length
        });
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }

    console.log('Parsed data sample:', data.slice(0, 2));
    return data;
  };

  // Enhanced coordinate parsing with validation
  const parseCoordinate = (value: string | null | undefined, type: 'latitude' | 'longitude'): number | null => {
    if (!value || value === 'null' || value === '') return null;
    
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return null;
    
    // Validate coordinate ranges
    if (type === 'latitude' && (parsed < -90 || parsed > 90)) {
      console.warn(`Invalid latitude value: ${parsed}`);
      return null;
    }
    
    if (type === 'longitude' && (parsed < -180 || parsed > 180)) {
      console.warn(`Invalid longitude value: ${parsed}`);
      return null;
    }
    
    // Round to 8 decimal places to match database precision
    return Math.round(parsed * 100000000) / 100000000;
  };

  // Enhanced input sanitization function
  const sanitizeInput = (input: string | null | undefined, maxLength: number = 255): string | null => {
    if (!input) return null;
    
    // Remove potentially dangerous characters and limit length
    const sanitized = input
      .replace(/[<>\"']/g, '') // Remove HTML/script injection characters
      .replace(/\0/g, '') // Remove null bytes
      .trim()
      .substring(0, maxLength);
    
    return sanitized || null;
  };

  // Import PHA data from CSV with enhanced security
  const importCSVData = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      // Security: Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please log in to import data.');
      }

      // Security: Validate file type and size
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Invalid file type. Only CSV files are allowed.');
      }

      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        throw new Error('File too large. Maximum size is 50MB.');
      }

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      console.log('Total records to process:', csvData.length);
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;

      // Process in smaller batches to prevent timeouts
      const batchSize = 50;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (const record of batch) {
          try {
            // Update progress
            const recordName = sanitizeInput(record.FORMAL_PARTICIPANT_NAME || record.name || record.PARTICIPANT_NAME || record.PHA_NAME) || `Record ${i + 1}`;
            setImportProgress({ 
              current: i + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Enhanced data mapping with sanitization
            const phaData = {
              pha_code: sanitizeInput(record.PARTICIPANT_CODE || record.pha_code || record.code, 50),
              name: sanitizeInput(record.FORMAL_PARTICIPANT_NAME || record.name || record.PARTICIPANT_NAME || record.PHA_NAME, 255),
              address: sanitizeInput(record.STD_ADDR || record.address || record.ADDRESS, 500),
              city: sanitizeInput(record.STD_CITY || record.city || record.CITY, 100),
              state: sanitizeInput((record.STD_ST || record.state || record.STATE), 2)?.substring(0, 2) || null,
              zip: sanitizeInput((record.STD_ZIP5 || record.zip || record.ZIP), 10)?.substring(0, 10) || null,
              phone: sanitizeInput(record.HA_PHN_NUM || record.phone || record.PHONE, 20),
              email: sanitizeInput(record.HA_EMAIL_ADDR_TEXT || record.EXEC_DIR_EMAIL || record.email || record.EMAIL, 255),
              website: sanitizeInput(record.website || record.WEBSITE, 255),
              supports_hcv: record.HA_PROGRAM_TYPE?.includes('Section 8') || 
                           (record.SECTION8_UNITS_CNT && parseInt(record.SECTION8_UNITS_CNT) > 0) || 
                           record.supports_hcv === 'true' || 
                           false,
              waitlist_status: sanitizeInput(record.waitlist_status || record.WAITLIST_STATUS, 50) || 'Unknown',
              latitude: parseCoordinate(record.LAT || record.latitude, 'latitude'),
              longitude: parseCoordinate(record.LON || record.longitude, 'longitude'),
              last_updated: new Date().toISOString()
            };

            console.log('Mapped PHA data:', phaData);

            // Enhanced validation - require name
            if (phaData.name && phaData.name.trim().length > 0) {
              const { error } = await supabase
                .from('pha_agencies')
                .upsert(phaData, { 
                  onConflict: 'pha_code',
                  ignoreDuplicates: false 
                });

              if (error) {
                console.error('Error upserting PHA record:', error);
                // Check if it's an authentication error
                if (error.message.includes('row-level security policy')) {
                  throw new Error('Authentication required for data import. Please ensure you are logged in.');
                }
                errorCount++;
              } else {
                processedCount++;
                console.log('Successfully processed record for:', phaData.name);
              }
            } else {
              console.log('Skipping record due to missing name:', record);
              errorCount++;
            }
          } catch (recordError) {
            console.error('Error processing PHA record:', recordError);
            errorCount++;
            
            // If we get too many errors, stop the import
            if (errorCount > 100) {
              throw new Error('Too many errors encountered. Import stopped for safety.');
            }
          }
        }
      }

      setImportResult({
        success: true,
        processedCount,
        errorCount,
        message: `Processed ${processedCount} PHA records, ${errorCount} errors`
      });
      
      toast({
        title: "Import Completed",
        description: `Processed ${processedCount} PHA records from CSV data`,
      });
      
      return { processedCount, errorCount };
    } catch (error) {
      console.error('CSV Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import CSV data';
      
      setImportResult({
        success: false,
        error: errorMessage
      });
      
      toast({
        title: "Import Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  return {
    isImporting,
    importProgress,
    importResult,
    importCSVData,
    setImportResult
  };
};
