
import { useState, useEffect } from 'react';

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

  const resetStats = () => {
    const emptyStats = { fileUploads: [] };
    updateStats(emptyStats);
  };

  // Calculate totals for summary
  const getTotals = () => {
    return importStats.fileUploads.reduce(
      (acc, upload) => ({
        totalFiles: acc.totalFiles + 1,
        totalAdded: acc.totalAdded + upload.recordsAdded,
        totalEdited: acc.totalEdited + upload.recordsEdited,
        totalRecords: acc.totalRecords + upload.totalRecords
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
