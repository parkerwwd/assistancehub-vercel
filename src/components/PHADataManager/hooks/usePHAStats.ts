
import { useState, useEffect } from 'react';

export interface ImportStats {
  filesUploaded: number;
  recordsAdded: number;
  recordsEdited: number;
  lastFileName?: string;
}

export const usePHAStats = () => {
  const [importStats, setImportStats] = useState<ImportStats>({
    filesUploaded: 0,
    recordsAdded: 0,
    recordsEdited: 0
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('pha_import_stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setImportStats(parsed);
      } catch (error) {
        console.error('Error parsing saved stats:', error);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  const updateStats = (newStats: Partial<ImportStats>) => {
    const updatedStats = { ...importStats, ...newStats };
    setImportStats(updatedStats);
    localStorage.setItem('pha_import_stats', JSON.stringify(updatedStats));
  };

  const incrementFileUpload = (fileName?: string) => {
    updateStats({
      filesUploaded: importStats.filesUploaded + 1,
      lastFileName: fileName
    });
  };

  const updateImportResults = (added: number, edited: number) => {
    updateStats({
      recordsAdded: importStats.recordsAdded + added,
      recordsEdited: importStats.recordsEdited + edited
    });
  };

  const resetStats = () => {
    const emptyStats = {
      filesUploaded: 0,
      recordsAdded: 0,
      recordsEdited: 0
    };
    setImportStats(emptyStats);
    localStorage.setItem('pha_import_stats', JSON.stringify(emptyStats));
  };

  return {
    importStats,
    incrementFileUpload,
    updateImportResults,
    resetStats
  };
};
