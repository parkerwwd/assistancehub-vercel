
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { usePHAImport } from "./PHADataManager/hooks/usePHAImport";
import { usePHACount } from "./PHADataManager/hooks/usePHACount";
import { usePHAStats } from "./PHADataManager/hooks/usePHAStats";
import { PHAStatsCard } from "./PHADataManager/components/PHAStatsCard";
import { PHAUploadsTable } from "./PHADataManager/components/PHAUploadsTable";
import { ImportProgressComponent } from "./PHADataManager/components/ImportProgress";
import { ImportControls } from "./PHADataManager/components/ImportControls";
import { ImportResults } from "./PHADataManager/components/ImportResults";
import { HUDFormatInfo } from "./PHADataManager/components/HUDFormatInfo";
import { SecurityNotice } from "./SecurityNotice";
import { deleteAllPHAData } from "@/services/phaDataService";
import { useToast } from "@/hooks/use-toast";

const PHADataManager: React.FC = () => {
  console.log('PHADataManager component rendering...');
  
  const { toast } = useToast();
  
  const { 
    isImporting, 
    importProgress, 
    importResult, 
    startImport,
    setImportResult: resetImportState
  } = usePHAImport();

  const { 
    totalPHAs, 
    lastImport, 
    setLastImport, 
    fetchPHACount 
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
    console.log('Starting direct file import:', file.name);
    resetImportState();
    
    try {
      await startImport(file);
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

  const handleResetStats = async () => {
    try {
      console.log('Starting complete reset - clearing stats and database...');
      
      // Clear all PHA data from database
      await deleteAllPHAData();
      
      // Reset local stats
      resetStats();
      
      // Refresh PHA count
      await fetchPHACount();
      
      toast({
        title: "Reset Complete",
        description: "All PHA data and statistics have been cleared successfully.",
      });
      
      console.log('✅ Complete reset successful');
    } catch (error) {
      console.error('❌ Reset failed:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to clear all data. Please try again.",
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All PHA Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all PHA records from the database and reset all import statistics. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetStats} className="bg-red-600 hover:bg-red-700">
                  Delete All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
