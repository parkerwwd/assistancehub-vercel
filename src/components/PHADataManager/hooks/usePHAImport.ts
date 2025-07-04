
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
      console.log('🚀 Starting CSV analysis for:', file.name);
      console.log('📊 File size:', file.size, 'bytes');
      console.log('📄 File type:', file.type);
      
      // Security validations
      validateCSVFile(file);
      console.log('✅ File validation passed');

      const csvText = await file.text();
      console.log('📖 CSV text length:', csvText.length);
      
      const csvData = parseCSV(csvText);
      console.log('📋 Parsed CSV data length:', csvData.length);
      
      if (csvData.length === 0) {
        console.error('❌ CSV file is empty or invalid');
        throw new Error('CSV file appears to be empty or invalid.');
      }

      // Extract headers for mapping
      const headers = extractCSVHeaders(csvText);
      console.log('📑 Extracted headers:', headers);

      setCsvHeaders(headers);
      setPendingFile(file);
      setShowMappingDialog(true);
      console.log('✅ CSV analysis completed, showing mapping dialog');
    } catch (error) {
      console.error('💥 Error analyzing CSV file:', error);
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
    console.log('🎯 Starting CSV import process');
    console.log('📂 File:', file.name);
    console.log('🗺️ Field mappings:', fieldMappings);
    
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
      // Security: Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No authentication session found');
        throw new Error('Authentication required. Please log in to import data.');
      }
      console.log('✅ Authentication verified for user:', session.user.email);

      // Security validations
      validateCSVFile(file);
      console.log('✅ File security validation passed');

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      console.log('📊 Import statistics:');
      console.log('  - Total records to process:', csvData.length);
      console.log('  - Active field mappings:', fieldMappings.filter(m => m.checked).length);
      
      setImportProgress({ current: 0, total: csvData.length });
      
      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process in smaller batches to prevent timeouts
      const batchSize = 25; // Reduced batch size for better performance
      console.log('🔄 Processing in batches of:', batchSize);
      
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(csvData.length/batchSize)} (${batch.length} records)`);
        
        for (let j = 0; j < batch.length; j++) {
          const record = batch[j];
          const currentIndex = i + j;
          
          try {
            // Update progress
            const recordName = record[fieldMappings.find(m => m.dbField === 'name')?.csvField || ''] || `Record ${currentIndex + 1}`;
            console.log(`⚡ Processing record ${currentIndex + 1}/${csvData.length}: ${recordName}`);
            
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
            console.log(`✅ Successfully processed record ${currentIndex + 1}`);
          } catch (recordError) {
            console.error(`❌ Error processing record ${currentIndex + 1}:`, recordError);
            errorCount++;
            const errorMsg = recordError instanceof Error ? recordError.message : 'Unknown error';
            errors.push(`Record ${currentIndex + 1}: ${errorMsg}`);
            
            // If we get too many errors, stop the import
            if (errorCount > 50) {
              console.error('🛑 Too many errors encountered, stopping import for safety');
              console.error('📋 Recent errors:', errors.slice(-10));
              throw new Error('Too many errors encountered. Import stopped for safety.');
            }
          }
        }
        
        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`✅ Completed batch ${Math.floor(i/batchSize) + 1}`);
      }

      const result = {
        success: true,
        processedCount,
        errorCount,
        message: `Processed ${processedCount} PHA records, ${errorCount} errors`
      };
      
      console.log('🎉 Import completed successfully:');
      console.log('  - Processed:', processedCount);
      console.log('  - Errors:', errorCount);
      console.log('  - Success rate:', ((processedCount / csvData.length) * 100).toFixed(2) + '%');
      
      if (errors.length > 0) {
        console.log('📋 Error summary:', errors);
      }
      
      setImportResult(result);
      
      toast({
        title: "Import Completed",
        description: `Processed ${processedCount} PHA records from CSV data`,
      });
      
      return { processedCount, errorCount };
    } catch (error) {
      console.error('💥 CSV Import error:', error);
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
      console.log('🏁 Import process finished');
    }
  }, [toast]);

  const handleMappingConfirm = useCallback(async (mappings: FieldMapping[]) => {
    console.log('✅ Field mapping confirmed:', mappings);
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
    console.log('🔄 Resetting import state');
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
