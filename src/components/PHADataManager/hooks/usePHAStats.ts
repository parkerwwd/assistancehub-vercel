
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface FileUploadRecord {
  fileName: string;
  uploadDate: string;
  recordsAdded: number;
  recordsEdited: number;
  totalRecords: number;
}

export interface ImportStats {
  fileUploads: FileUploadRecord[];
}

export const usePHAStats = () => {
  const [importStats, setImportStats] = useState<ImportStats>({
    fileUploads: []
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('pha_import_stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        // Handle legacy format
        if (parsed.filesUploaded !== undefined) {
          setImportStats({ fileUploads: [] });
        } else {
          setImportStats(parsed);
        }
      } catch (error) {
        console.error('Error parsing saved stats:', error);
        setImportStats({ fileUploads: [] });
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  const updateStats = (newStats: ImportStats) => {
    setImportStats(newStats);
    localStorage.setItem('pha_import_stats', JSON.stringify(newStats));
  };

  const addFileUpload = (fileName: string, recordsAdded: number, recordsEdited: number) => {
    const newUpload: FileUploadRecord = {
      fileName,
      uploadDate: new Date().toISOString(),
      recordsAdded,
      recordsEdited,
      totalRecords: recordsAdded + recordsEdited
    };

    const updatedStats = {
      fileUploads: [...importStats.fileUploads, newUpload]
    };

    updateStats(updatedStats);
  };

  const resetStats = async () => {
    // Clear all PHA data from the database
    const { error } = await supabase
      .from('pha_agencies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing PHA data:', error);
      throw error;
    }

    // Clear local statistics
    const emptyStats = { fileUploads: [] };
    updateStats(emptyStats);
  };

  // Calculate totals for summary - ensure it always returns a valid object
  const getTotals = () => {
    if (!importStats?.fileUploads || !Array.isArray(importStats.fileUploads)) {
      return { totalFiles: 0, totalAdded: 0, totalEdited: 0, totalRecords: 0 };
    }
    
    return importStats.fileUploads.reduce(
      (acc, upload) => ({
        totalFiles: acc.totalFiles + 1,
        totalAdded: acc.totalAdded + (upload.recordsAdded || 0),
        totalEdited: acc.totalEdited + (upload.recordsEdited || 0),
        totalRecords: acc.totalRecords + (upload.totalRecords || 0)
      }),
      { totalFiles: 0, totalAdded: 0, totalEdited: 0, totalRecords: 0 }
    );
  };

  return {
    importStats,
    addFileUpload,
    resetStats,
    getTotals
  };
};
