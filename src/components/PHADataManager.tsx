
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePHAImport } from "./PHADataManager/hooks/usePHAImport";
import { usePHACount } from "./PHADataManager/hooks/usePHACount";
import { usePHAStats } from "./PHADataManager/hooks/usePHAStats";
import { PHAStatsCard } from "./PHADataManager/components/PHAStatsCard";
import { PHAUploadsTable } from "./PHADataManager/components/PHAUploadsTable";
import { ImportProgressComponent } from "./PHADataManager/components/ImportProgress";
import { ImportControls } from "./PHADataManager/components/ImportControls";
import { ImportResults } from "./PHADataManager/components/ImportResults";
import { HUDFormatInfo } from "./PHADataManager/components/HUDFormatInfo";
import { FieldMappingDialog } from "./PHADataManager/components/FieldMappingDialog";
import { SecurityNotice } from "./SecurityNotice";

const PHADataManager: React.FC = () => {
  console.log('PHADataManager component rendering...');
  
  const { 
    isImporting, 
    importProgress, 
    importResult, 
    startImport,
    setImportResult: resetImportState,
    showMappingDialog,
    setShowMappingDialog,
    csvHeaders,
    handleMappingConfirm
  } = usePHAImport();

  const { 
    totalPHAs, 
    lastImport, 
    setLastImport, 
    fetchPHACount,
    setTotalPHAs
  } = usePHACount();

  const {
    importStats,
    addFileUpload,
    resetStats,
    getTotals
  } = usePHAStats();

  console.log('PHADataManager state:', { 
    totalPHAs, 
    importStats: importStats?.fileUploads?.length || 0,
    isImporting 
  });

  const handleFileImport = async (file: File) => {
    console.log('Starting file import:', file.name);
    resetImportState();
    await startImport(file);
  };

  const handleMappingComplete = async (mappings: any) => {
    try {
      await handleMappingConfirm(mappings);
      setLastImport(new Date());
      
      // Update stats with import results
      if (importResult && importResult.processedCount !== undefined) {
        const recordsAdded = importResult.processedCount || 0;
        const recordsEdited = importResult.errorCount || 0;
        addFileUpload('Latest Import', recordsAdded, recordsEdited);
      }
      
      await fetchPHACount();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleResetAllStats = () => {
    console.log('Resetting all statistics...');
    // Reset import stats
    resetStats();
    // Reset PHA count
    setTotalPHAs(0);
    // Reset last import date
    setLastImport(null);
    // Reset any import results
    resetImportState();
    console.log('All statistics have been reset');
  };

  const totals = getTotals();
  console.log('Calculated totals:', totals);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            HUD PHA Data Management
          </CardTitle>
          <Button
            onClick={handleResetAllStats}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Stats
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SecurityNotice />
        
        <PHAStatsCard 
          totalPHAs={totalPHAs || 0} 
          lastImport={lastImport}
          totals={totals}
        />
        
        <ImportProgressComponent 
          importProgress={importProgress || { current: 0, total: 0 }} 
          isImporting={isImporting || false} 
        />

        <ImportControls
          isImporting={isImporting || false}
          importProgress={importProgress || { current: 0, total: 0 }}
          onFileSelect={handleFileImport}
        />

        <ImportResults importResult={importResult} />

        <PHAUploadsTable uploads={importStats?.fileUploads || []} />

        <HUDFormatInfo />

        <FieldMappingDialog
          open={showMappingDialog}
          onOpenChange={setShowMappingDialog}
          csvHeaders={csvHeaders}
          onMappingConfirm={handleMappingComplete}
        />
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
