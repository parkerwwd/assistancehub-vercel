
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

  // Create automatic field mappings based on CSV headers
  const createAutoMappings = (csvHeaders: string[]) => {
    console.log('Creating auto mappings for headers:', csvHeaders);
    const mappings: Array<{ csvField: string; dbField: string }> = [];
    
    csvHeaders.forEach(csvField => {
      const normalizedField = csvField.toUpperCase().trim();
      const dbField = COMMON_MAPPINGS[normalizedField];
      
      console.log(`Checking field: "${csvField}" -> normalized: "${normalizedField}" -> mapped to: "${dbField}"`);
      
      if (dbField) {
        mappings.push({
          csvField,
          dbField
        });
      } else {
        console.log(`No mapping found for field: "${csvField}"`);
      }
    });
    
    console.log('Final auto mappings:', mappings);
    return mappings;
  };

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

      console.log('First CSV record sample:', csvData[0]);

      // Create automatic field mappings
      const csvHeaders = Object.keys(csvData[0]);
      console.log('CSV headers detected:', csvHeaders);
      
      const autoMappings = createAutoMappings(csvHeaders);
      
      console.log('Auto-generated field mappings:', autoMappings);
      console.log('Total records to process:', csvData.length);
      
      if (autoMappings.length === 0) {
        throw new Error('No field mappings could be created. Please check your CSV format and headers.');
      }
      
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
            const recordName = record[autoMappings.find(m => m.dbField === 'name')?.csvField || ''] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Process the record using auto-mapped fields
            const phaData = processPHARecord(record, autoMappings);

            // Only proceed if we have essential data
            if (!phaData.name) {
              console.warn(`Skipping record ${currentIndex + 1}: No name found`);
              errorCount++;
              continue;
            }

            // Save to database
            await upsertPHARecord(phaData);
            processedCount++;
            
            console.log(`✅ Successfully processed record ${currentIndex + 1}: ${phaData.name}`);
          } catch (recordError) {
            console.error(`Error processing PHA record ${currentIndex + 1}:`, recordError);
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
        description: `Processed ${processedCount} PHA records from CSV data`,
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
    setImportResult: resetImportState,
    // Remove modal-related properties
    showMappingDialog: false,
    setShowMappingDialog: () => {},
    csvHeaders: [],
    handleMappingConfirm: () => {}
  };
};
