import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';
import { parseCSV, validateCSVFile } from '../utils/csvParser';
import { processPHARecord, upsertPHARecord } from '../services/phaImportService';
import { COMMON_MAPPINGS } from '../components/fieldMapping/constants';

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Enhanced field mapping with validation
  const createAutoMappings = (csvHeaders: string[]) => {
    console.log('Creating auto mappings for headers:', csvHeaders);
    const mappings: Array<{ csvField: string; dbField: string }> = [];
    
    // Log the header analysis
    csvHeaders.forEach((csvField, index) => {
      const normalizedField = csvField.toUpperCase().trim();
      const dbField = COMMON_MAPPINGS[normalizedField];
      
      console.log(`Header ${index}: "${csvField}" -> normalized: "${normalizedField}" -> mapped to: "${dbField || 'UNMAPPED'}"`);
      
      if (dbField) {
        mappings.push({
          csvField,
          dbField
        });
      }
    });
    
    console.log('Final auto mappings:', mappings);
    console.log(`Mapped ${mappings.length} out of ${csvHeaders.length} fields`);
    
    return mappings;
  };

  // Enhanced import with better error handling and validation
  const startImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      console.log('Starting direct CSV import for:', file.name);
      
      // Security: Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please log in to import data.');
      }

      // Security validations
      validateCSVFile(file);

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      if (csvData.length === 0) {
        throw new Error('CSV file appears to be empty or invalid.');
      }

      console.log('CSV parsing complete. Records found:', csvData.length);
      console.log('First record sample:', csvData[0]);
      console.log('CSV headers:', Object.keys(csvData[0]));

      // Create automatic field mappings with validation
      const csvHeaders = Object.keys(csvData[0]);
      const autoMappings = createAutoMappings(csvHeaders);
      
      if (autoMappings.length === 0) {
        throw new Error('No field mappings could be created. Please check your CSV format and headers.');
      }
      
      console.log(`Successfully mapped ${autoMappings.length} fields out of ${csvHeaders.length} total headers`);
      
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process in smaller batches with enhanced error tracking
      const batchSize = 10; // Reduced batch size for better error tracking
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (let j = 0; j < batch.length; j++) {
          const record = batch[j];
          const currentIndex = i + j;
          
          try {
            // Update progress with more detailed info
            const recordName = record[autoMappings.find(m => m.dbField === 'name')?.csvField || ''] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            console.log(`\n--- Processing record ${currentIndex + 1}/${csvData.length} ---`);
            console.log('Raw CSV record:', record);
            
            // Process the record using auto-mapped fields with validation
            const phaData = processPHARecord(record, autoMappings);
            console.log('Processed PHA data:', phaData);

            // Enhanced validation before save
            if (!phaData.name || phaData.name.trim().length === 0) {
              console.warn(`Skipping record ${currentIndex + 1}: No valid name found`);
              errorCount++;
              errors.push(`Record ${currentIndex + 1}: Missing or invalid PHA name`);
              continue;
            }

            // Additional validation for critical fields
            let hasValidData = false;
            const criticalFields = ['phone', 'email', 'address', 'total_units', 'pha_code'];
            for (const field of criticalFields) {
              if (phaData[field] && phaData[field] !== null) {
                hasValidData = true;
                break;
              }
            }

            if (!hasValidData) {
              console.warn(`Skipping record ${currentIndex + 1}: No valid data in critical fields`);
              errorCount++;
              errors.push(`Record ${currentIndex + 1}: No valid data in critical fields`);
              continue;
            }

            // Save to database
            await upsertPHARecord(phaData);
            processedCount++;
            
            console.log(`✅ Successfully processed record ${currentIndex + 1}: ${phaData.name}`);
          } catch (recordError) {
            const errorMsg = `Record ${currentIndex + 1}: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`;
            console.error(errorMsg, recordError);
            errorCount++;
            errors.push(errorMsg);
            
            // If we get too many errors, stop the import
            if (errorCount > 100) {
              throw new Error(`Too many errors encountered (${errorCount}). Import stopped for safety. Sample errors: ${errors.slice(0, 5).join('; ')}`);
            }
          }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const result = {
        success: true,
        processedCount,
        errorCount,
        message: `Processed ${processedCount} PHA records successfully${errorCount > 0 ? `, ${errorCount} errors encountered` : ''}`
      };
      
      setImportResult(result);
      
      // Show detailed results
      toast({
        title: "Import Completed",
        description: `Successfully imported ${processedCount} records${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
      });

      if (errors.length > 0) {
        console.log('Import errors summary:', errors.slice(0, 10));
      }
      
      return { processedCount, errorCount };
    } catch (error) {
      console.error('CSV Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import CSV data';
      
      const result = {
        success: false,
        error: errorMessage
      };
      
      setImportResult(result);
      
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
  }, [toast]);

  const resetImportState = useCallback(() => {
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });
  }, []);

  return {
    isImporting,
    importProgress,
    importResult,
    startImport,
    setImportResult: resetImportState,
    // Remove modal-related properties
    showMappingDialog: false,
    setShowMappingDialog: () => {},
    csvHeaders: [],
    handleMappingConfirm: () => {}
  };
};
