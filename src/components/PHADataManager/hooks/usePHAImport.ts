
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';
import { parseCSV, validateCSVFile } from '../utils/csvParser';
import { processPHARecord, upsertPHARecord } from '../services/phaImportService';

// Predefined HUD field mappings
const HUD_FIELD_MAPPINGS = [
  { csvField: 'PARTICIPANT_CODE', dbField: 'pha_code' },
  { csvField: 'FORMAL_PARTICIPANT_NAME', dbField: 'name' },
  { csvField: 'FULL_ADDRESS', dbField: 'address' },
  { csvField: 'HA_PHN_NUM', dbField: 'phone' },
  { csvField: 'HA_FAX_NUM', dbField: 'fax' },
  { csvField: 'HA_EMAIL_ADDR_TEXT', dbField: 'email' },
  { csvField: 'EXEC_DIR_PHONE', dbField: 'exec_dir_phone' },
  { csvField: 'EXEC_DIR_FAX', dbField: 'exec_dir_fax' },
  { csvField: 'EXEC_DIR_EMAIL', dbField: 'exec_dir_email' },
  { csvField: 'PHAS_DESIGNATION', dbField: 'performance_status' },
  { csvField: 'HA_PROGRAM_TYPE', dbField: 'program_type' },
  { csvField: 'HA_LOW_RENT_SIZE_CATEGORY', dbField: 'low_rent_size_category' },
  { csvField: 'HA_SECTION_8_SIZE_CATEGORY', dbField: 'section8_size_category' },
  { csvField: 'HA_COMBINED_SIZE_CATEGORY', dbField: 'combined_size_category' },
  { csvField: 'HA_FYE', dbField: 'fiscal_year_end' },
  { csvField: 'TOTAL_UNITS', dbField: 'total_units' },
  { csvField: 'TOTAL_DWELLING_UNITS', dbField: 'total_dwelling_units' },
  { csvField: 'PH_OCCUPIED', dbField: 'ph_occupied' },
  { csvField: 'SECTION8_UNITS_CNT', dbField: 'section8_units_count' },
  { csvField: 'SECTION8_OCCUPIED', dbField: 'section8_occupied' }
];

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Direct import without modal
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
      
      console.log('Total records to process:', csvData.length);
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;

      // Process in smaller batches to prevent timeouts
      const batchSize = 25;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (let j = 0; j < batch.length; j++) {
          const record = batch[j];
          const currentIndex = i + j;
          
          try {
            // Update progress
            const recordName = record['FORMAL_PARTICIPANT_NAME'] || record['PARTICIPANT_CODE'] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Process the record using predefined HUD field mappings
            const phaData = processPHARecord(record, HUD_FIELD_MAPPINGS);

            // Save to database
            await upsertPHARecord(phaData);
            processedCount++;
          } catch (recordError) {
            console.error('Error processing PHA record:', recordError);
            errorCount++;
            
            // If we get too many errors, stop the import
            if (errorCount > 50) {
              throw new Error('Too many errors encountered. Import stopped for safety.');
            }
          }
        }
        
        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const result = {
        success: true,
        processedCount,
        errorCount,
        message: `Processed ${processedCount} PHA records, ${errorCount} errors`
      };
      
      setImportResult(result);
      
      toast({
        title: "Import Completed",
        description: `Processed ${processedCount} PHA records from HUD CSV data`,
      });
      
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
    setImportResult: resetImportState
  };
};
