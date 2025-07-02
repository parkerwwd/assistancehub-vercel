
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Parse CSV data with better delimiter detection
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    console.log('Total lines in CSV:', lines.length);
    console.log('First line (headers):', lines[0]);
    
    // Try to detect delimiter (tab or comma)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    console.log('Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
    
    // Parse headers
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    console.log('Headers found:', headers);
    
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
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

  // Import PHA data from CSV
  const importCSVData = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      console.log('Total records to process:', csvData.length);
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        const record = csvData[i];
        
        try {
          console.log('Processing record:', record);
          
          // Update progress
          const recordName = record.FORMAL_PARTICIPANT_NAME || record.name || record.PARTICIPANT_NAME || record.PHA_NAME || `Record ${i + 1}`;
          setImportProgress({ 
            current: i + 1, 
            total: csvData.length, 
            currentRecord: recordName 
          });
          
          // Map comprehensive CSV fields to database fields with more flexible field mapping
          const phaData = {
            pha_code: record.PARTICIPANT_CODE || record.pha_code || record.code || null,
            name: record.FORMAL_PARTICIPANT_NAME || record.name || record.PARTICIPANT_NAME || record.PHA_NAME || null,
            address: record.STD_ADDR || record.address || record.ADDRESS || null,
            city: record.STD_CITY || record.city || record.CITY || null,
            state: (record.STD_ST || record.state || record.STATE)?.substring(0, 2) || null,
            zip: (record.STD_ZIP5 || record.zip || record.ZIP)?.substring(0, 10) || null,
            phone: record.HA_PHN_NUM || record.phone || record.PHONE || null,
            email: record.HA_EMAIL_ADDR_TEXT || record.EXEC_DIR_EMAIL || record.email || record.EMAIL || null,
            website: record.website || record.WEBSITE || null,
            supports_hcv: record.HA_PROGRAM_TYPE?.includes('Section 8') || 
                         (record.SECTION8_UNITS_CNT && parseInt(record.SECTION8_UNITS_CNT) > 0) || 
                         record.supports_hcv === 'true' || 
                         false,
            waitlist_status: record.waitlist_status || record.WAITLIST_STATUS || 'Unknown',
            latitude: record.LAT ? parseFloat(record.LAT) : (record.latitude ? parseFloat(record.latitude) : null),
            longitude: record.LON ? parseFloat(record.LON) : (record.longitude ? parseFloat(record.longitude) : null),
            last_updated: new Date().toISOString()
          };

          console.log('Mapped PHA data:', phaData);

          // More lenient validation - only require name
          if (phaData.name && phaData.name.trim().length > 0) {
            const { error } = await supabase
              .from('pha_agencies')
              .upsert(phaData, { 
                onConflict: 'pha_code',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error('Error upserting PHA record:', error);
              errorCount++;
            } else {
              processedCount++;
              console.log('Successfully processed record for:', phaData.name);
            }
          } else {
            console.log('Skipping record due to missing name:', record);
          }
        } catch (recordError) {
          console.error('Error processing PHA record:', recordError);
          errorCount++;
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
      setImportResult({
        success: false,
        error: error.message || 'Failed to import CSV data'
      });
      toast({
        title: "Import Error",
        description: "Failed to process CSV file",
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
