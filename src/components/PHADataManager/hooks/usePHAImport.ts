
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';
import { parseCSV, validateCSVFile } from '../utils/csvParser';
import { processPHARecord, upsertPHARecord } from '../services/phaImportService';

// Updated HUD field mappings to match actual HUD CSV format
const HUD_FIELD_MAPPINGS = [
  { csvField: 'PARTICIPANT_CODE', dbField: 'pha_code' },
  { csvField: 'FORMAL_PARTICIPANT_NAME', dbField: 'name' },
  { csvField: 'PARTICIPANT_NAME', dbField: 'name' }, // Alternative name field
  
  // Address components (separate fields in actual HUD CSV)
  { csvField: 'STD_ADDR', dbField: 'address' },
  { csvField: 'ADDRESS', dbField: 'address' }, // Alternative address field
  { csvField: 'FULL_ADDRESS', dbField: 'address' }, // Fallback for combined address
  { csvField: 'STD_CITY', dbField: 'city' },
  { csvField: 'CITY', dbField: 'city' }, // Alternative city field
  { csvField: 'STD_ST', dbField: 'state' },
  { csvField: 'STATE', dbField: 'state' }, // Alternative state field
  { csvField: 'STD_ZIP5', dbField: 'zip' },
  { csvField: 'ZIP', dbField: 'zip' }, // Alternative zip field
  
  // Contact information
  { csvField: 'HA_PHN_NUM', dbField: 'phone' },
  { csvField: 'PHONE', dbField: 'phone' }, // Alternative phone field
  { csvField: 'HA_FAX_NUM', dbField: 'fax' },
  { csvField: 'HA_EMAIL_ADDR_TEXT', dbField: 'email' },
  { csvField: 'EMAIL', dbField: 'email' }, // Alternative email field
  { csvField: 'EXEC_DIR_PHONE', dbField: 'exec_dir_phone' },
  { csvField: 'EXEC_DIR_FAX', dbField: 'exec_dir_fax' },
  { csvField: 'EXEC_DIR_EMAIL', dbField: 'exec_dir_email' },
  { csvField: 'WEBSITE', dbField: 'website' },
  
  // Geographic coordinates
  { csvField: 'LAT', dbField: 'latitude' },
  { csvField: 'LATITUDE', dbField: 'latitude' },
  { csvField: 'LON', dbField: 'longitude' },
  { csvField: 'LONGITUDE', dbField: 'longitude' },
  
  // PHA details and performance
  { csvField: 'PHAS_DESIGNATION', dbField: 'performance_status' },
  { csvField: 'PERFORMANCE_STATUS', dbField: 'performance_status' }, // Alternative field
  { csvField: 'HA_PROGRAM_TYPE', dbField: 'program_type' },
  { csvField: 'PROGRAM_TYPE', dbField: 'program_type' }, // Alternative field
  
  // Size categories
  { csvField: 'HA_LOW_RENT_SIZE_CATEGORY', dbField: 'low_rent_size_category' },
  { csvField: 'HA_SECTION_8_SIZE_CATEGORY', dbField: 'section8_size_category' },
  { csvField: 'HA_COMBINED_SIZE_CATEGORY', dbField: 'combined_size_category' },
  
  // Financial and operational data
  { csvField: 'HA_FYE', dbField: 'fiscal_year_end' },
  { csvField: 'FISCAL_YEAR_END', dbField: 'fiscal_year_end' }, // Alternative field
  { csvField: 'TOTAL_UNITS', dbField: 'total_units' },
  { csvField: 'TOTAL_DWELLING_UNITS', dbField: 'total_dwelling_units' },
  { csvField: 'PH_OCCUPIED', dbField: 'ph_occupied' },
  { csvField: 'SECTION8_UNITS_CNT', dbField: 'section8_units_count' },
  { csvField: 'SECTION8_OCCUPIED', dbField: 'section8_occupied' },
  
  // Waitlist status
  { csvField: 'WAITLIST_STATUS', dbField: 'waitlist_status' }
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
      console.log('Sample CSV headers:', Object.keys(csvData[0] || {}));
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
            const recordName = record['FORMAL_PARTICIPANT_NAME'] || record['PARTICIPANT_NAME'] || record['PARTICIPANT_CODE'] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Process the record using updated HUD field mappings
            const phaData = processPHARecord(record, HUD_FIELD_MAPPINGS);

            // Enhanced Section 8 support detection
            if (!phaData.supports_hcv) {
              const programType = record['HA_PROGRAM_TYPE'] || record['PROGRAM_TYPE'] || '';
              const section8Units = parseInt(record['SECTION8_UNITS_CNT'] || '0');
              
              phaData.supports_hcv = 
                programType.toLowerCase().includes('section 8') ||
                programType.toLowerCase().includes('section8') ||
                programType.toLowerCase().includes('both') ||
                section8Units > 0;
            }

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
