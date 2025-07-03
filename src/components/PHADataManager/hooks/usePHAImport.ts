
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportProgress } from '../types';
import { FieldMapping } from '../components/FieldMappingDialog';
import { parseCSV, extractCSVHeaders, validateCSVFile } from '../utils/csvParser';
import { processPHARecord, upsertPHARecord } from '../services/phaImportService';

export const usePHAImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const { toast } = useToast();

  // Memoize the startImport function to prevent unnecessary re-renders
  const startImport = useCallback(async (file: File) => {
    try {
      console.log('Starting CSV analysis for:', file.name);
      
      // Security validations
      validateCSVFile(file);

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      if (csvData.length === 0) {
        throw new Error('CSV file appears to be empty or invalid.');
      }

      // Extract headers for mapping
      const headers = extractCSVHeaders(csvText);
      console.log('Extracted headers:', headers);

      setCsvHeaders(headers);
      setPendingFile(file);
      setShowMappingDialog(true);
    } catch (error) {
      console.error('Error analyzing CSV file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze CSV file';
      toast({
        title: "File Analysis Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Import PHA data from CSV with field mapping
  const importCSVData = useCallback(async (file: File, fieldMappings: FieldMapping[]) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      console.log('Starting CSV import with mappings:', fieldMappings);
      
      // Security: Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please log in to import data.');
      }

      // Security validations
      validateCSVFile(file);

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      console.log('Total records to process:', csvData.length);
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;

      // Process in smaller batches to prevent timeouts
      const batchSize = 25; // Reduced batch size for better performance
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (let j = 0; j < batch.length; j++) {
          const record = batch[j];
          const currentIndex = i + j;
          
          try {
            // Update progress
            const recordName = record[fieldMappings.find(m => m.dbField === 'name')?.csvField || ''] || `Record ${currentIndex + 1}`;
            setImportProgress({ 
              current: currentIndex + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Process the record using mapped fields
            const phaData = processPHARecord(record, fieldMappings);

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

  const handleMappingConfirm = useCallback(async (mappings: FieldMapping[]) => {
    setShowMappingDialog(false);
    if (pendingFile) {
      try {
        await importCSVData(pendingFile, mappings);
      } finally {
        setPendingFile(null);
        setCsvHeaders([]);
      }
    }
  }, [pendingFile, importCSVData]);

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
    showMappingDialog,
    setShowMappingDialog,
    csvHeaders,
    handleMappingConfirm
  };
};
