
import { useState } from 'react';
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

  // Start the import process by analyzing CSV structure
  const startImport = async (file: File) => {
    try {
      // Security validations
      validateCSVFile(file);

      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      if (csvData.length === 0) {
        throw new Error('CSV file appears to be empty or invalid.');
      }

      // Extract headers for mapping
      const headers = extractCSVHeaders(csvText);

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
  };

  // Import PHA data from CSV with field mapping
  const importCSVData = async (file: File, fieldMappings: FieldMapping[]) => {
    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });

    try {
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
      const batchSize = 50;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (const record of batch) {
          try {
            // Update progress
            const recordName = record[fieldMappings.find(m => m.dbField === 'name')?.csvField || ''] || `Record ${i + 1}`;
            setImportProgress({ 
              current: i + 1, 
              total: csvData.length, 
              currentRecord: recordName 
            });
            
            // Process the record using mapped fields
            const phaData = processPHARecord(record, fieldMappings);

            console.log('Mapped PHA data:', phaData);

            // Save to database
            await upsertPHARecord(phaData);
            processedCount++;
            console.log('Successfully processed record for:', phaData.name);
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

  const handleMappingConfirm = async (mappings: FieldMapping[]) => {
    setShowMappingDialog(false);
    if (pendingFile) {
      await importCSVData(pendingFile, mappings);
      setPendingFile(null);
      setCsvHeaders([]);
    }
  };

  return {
    isImporting,
    importProgress,
    importResult,
    startImport,
    importCSVData,
    setImportResult,
    showMappingDialog,
    setShowMappingDialog,
    csvHeaders,
    handleMappingConfirm
  };
};
