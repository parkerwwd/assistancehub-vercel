
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

  // Fetch real data from audit log
  const fetchRealStats = async () => {
    try {
      const { data: auditLogs } = await supabase
        .from('pha_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditLogs) {
        // Group audit logs by day to simulate file imports
        const groupedLogs = auditLogs.reduce((acc: any, log) => {
          const date = new Date(log.created_at).toDateString();
          if (!acc[date]) {
            acc[date] = { inserts: 0, updates: 0 };
          }
          if (log.action === 'INSERT') {
            acc[date].inserts++;
          } else if (log.action === 'UPDATE') {
            acc[date].updates++;
          }
          return acc;
        }, {});

        // Convert to FileUploadRecord format
        const fileUploads: FileUploadRecord[] = Object.entries(groupedLogs).map(([date, stats]: [string, any]) => ({
          fileName: `Import ${date}`,
          uploadDate: new Date(date).toISOString(),
          recordsAdded: stats.inserts,
          recordsEdited: stats.updates,
          totalRecords: stats.inserts + stats.updates
        }));

        setImportStats({ fileUploads });
      }
    } catch (error) {
      console.error('Error fetching real stats:', error);
    }
  };

  // Load real stats on mount
  useEffect(() => {
    fetchRealStats();
  }, []);

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

    setImportStats(updatedStats);
    // Also refresh real stats after adding
    setTimeout(fetchRealStats, 1000);
  };

  const resetStats = async () => {
    setImportStats({ fileUploads: [] });
    // Refresh real stats after reset
    await fetchRealStats();
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
    getTotals,
    refreshStats: fetchRealStats
  };
};
