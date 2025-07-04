
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';
import { parseCSV, validateCSVFile } from '../utils/csvParser';
import { processPHARecord, upsertPHARecord } from '../services/phaImportService';
import { analyzeCSVStructure } from '../components/fieldMapping/constants';

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Enhanced import with intelligent CSV structure analysis
  const startImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      console.log('Starting intelligent CSV import for:', file.name);
      
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
      console.log('Sample record for analysis:', csvData[0]);

      // Use intelligent CSV structure analysis instead of simple mapping
      const intelligentMappings = analyzeCSVStructure(csvData);
      
      if (intelligentMappings.length === 0) {
        throw new Error('No field mappings could be created. The CSV structure is not recognized.');
      }
      
      console.log(`✅ Intelligent analysis created ${intelligentMappings.length} field mappings`);
      
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process in batches with enhanced error tracking
      const batchSize = 5; // Smaller batches for better error tracking
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (let j = 0; j < batch.length; j++) {
          const record = batch[j];
          const currentIndex = i + j;
          
          try {
            // Update progress with more detailed info
            const recordName = record['FORMAL_PARTICIPANT_NAME'] || record['PARTICIPANT_NAME'] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            console.log(`\n--- Processing record ${currentIndex + 1}/${csvData.length}: ${recordName} ---`);
            
            // Process the record using intelligent mappings
            const phaData = processPHARecord(record, intelligentMappings);
            console.log('Processed PHA data:', phaData);

            // Enhanced validation before save
            if (!phaData.name || phaData.name.trim().length === 0) {
              console.warn(`❌ Skipping record ${currentIndex + 1}: No valid name found`);
              errorCount++;
              errors.push(`Record ${currentIndex + 1}: Missing or invalid PHA name`);
              continue;
            }

            // Check for at least some valid data
            const hasContactData = phaData.phone || phaData.email || phaData.exec_dir_phone || phaData.exec_dir_email;
            const hasAddressData = phaData.address;
            const hasUnitData = phaData.total_units || phaData.section8_units_count || phaData.ph_occupied;
            
            if (!hasContactData && !hasAddressData && !hasUnitData) {
              console.warn(`❌ Skipping record ${currentIndex + 1}: No valid contact, address, or unit data`);
              errorCount++;
              errors.push(`Record ${currentIndex + 1}: No meaningful data found`);
              continue;
            }

            // Save to database
            await upsertPHARecord(phaData);
            processedCount++;
            
            console.log(`✅ Successfully processed record ${currentIndex + 1}: ${phaData.name}`);
          } catch (recordError) {
            const errorMsg = `Record ${currentIndex + 1}: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`;
            console.error('❌', errorMsg, recordError);
            errorCount++;
            errors.push(errorMsg);
            
            // If we get too many errors, stop the import
            if (errorCount > 50) {
              throw new Error(`Too many errors encountered (${errorCount}). Import stopped. Sample errors: ${errors.slice(0, 5).join('; ')}`);
            }
          }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const result = {
        success: true,
        processedCount,
        errorCount,
        message: `Successfully processed ${processedCount} PHA records${errorCount > 0 ? `, ${errorCount} records had errors` : ''}`
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
      console.error('❌ CSV Import error:', error);
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
    showMappingDialog: false,
    setShowMappingDialog: () => {},
    csvHeaders: [],
    handleMappingConfirm: () => {}
  };
};
