
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useToast } from "@/hooks/use-toast";

const PHADataManager: React.FC = () => {
  console.log('PHADataManager component rendering...');
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  
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
    setTotalPHAs,
    clearAllPHAData
  } = usePHACount();

  const {
    importStats,
    addFileUpload,
    resetStats,
    getTotals,
    refreshStats
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
      // Refresh stats to get latest data from database
      await refreshStats();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleResetAllStats = async () => {
    try {
      console.log('🗑️ Resetting all statistics and clearing database...');
      
      // Show loading toast
      toast({
        title: "Clearing Data",
        description: "Removing all PHA records from database...",
      });

      // Clear database records
      await clearAllPHAData();
      
      // Reset import stats
      await resetStats();
      
      // Reset last import date
      setLastImport(null);
      
      // Reset any import results
      resetImportState();
      
      console.log('✅ All statistics and database records have been reset');
      
      toast({
        title: "Data Cleared",
        description: "All PHA records and statistics have been successfully removed.",
      });
    } catch (error) {
      console.error('❌ Error resetting data:', error);
      toast({
        title: "Error",
        description: "Failed to clear database records. Please try again.",
        variant: "destructive",
      });
    }
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
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isImporting}
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

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Statistics</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all PHA records and statistics from the database. 
                This cannot be undone. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowResetDialog(false);
                  handleResetAllStats();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Reset All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
