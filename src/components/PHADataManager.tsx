
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RotateCcw, TrendingUp, Activity } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <SecurityNotice />
        
        {/* Enhanced Stats Cards with Gradient */}
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 border border-blue-200/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg shadow-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Database Statistics
                </h2>
              </div>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-lg transition-all duration-200 text-xs px-2 sm:px-3 py-1.5 sm:py-2 h-auto flex-shrink-0 text-red-600 hover:text-red-700"
                disabled={isImporting}
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline font-medium">Reset</span>
              </Button>
            </div>
            <PHAStatsCard 
              totalPHAs={totalPHAs || 0} 
              lastImport={lastImport}
              totals={totals}
            />
          </div>
        </div>

        {/* Import Progress Section with Gradient */}
        {isImporting && (
          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-emerald-200/50 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-lg shadow-lg animate-pulse">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                  Import Progress
                </h2>
              </div>
              <ImportProgressComponent 
                importProgress={importProgress || { current: 0, total: 0 }} 
                isImporting={isImporting || false} 
              />
            </div>
          </div>
        )}

        {/* Import Controls Section with Gradient */}
        <div className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 border border-violet-200/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-lg shadow-lg">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-violet-800 via-purple-700 to-fuchsia-700 bg-clip-text text-transparent">
                Data Import Controls
              </h2>
            </div>
            <ImportControls
              isImporting={isImporting || false}
              importProgress={importProgress || { current: 0, total: 0 }}
              onFileSelect={handleFileImport}
            />
          </div>
        </div>

        <ImportResults importResult={importResult} />

        {/* Upload History Section with Gradient */}
        <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-100 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 border border-amber-200/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-lg shadow-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-red-700 bg-clip-text text-transparent">
                Import History
              </h2>
            </div>
            <PHAUploadsTable uploads={importStats?.fileUploads || []} />
          </div>
        </div>

        <FieldMappingDialog
          open={showMappingDialog}
          onOpenChange={setShowMappingDialog}
          csvHeaders={csvHeaders}
          onMappingConfirm={handleMappingComplete}
        />

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent className="max-w-sm sm:max-w-md mx-3 sm:mx-auto bg-gradient-to-br from-white to-red-50/50 backdrop-blur-sm border border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-red-800 to-red-700 bg-clip-text text-transparent">
                  Reset All Data
                </span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700 leading-relaxed text-sm">
                This will permanently delete all PHA records and statistics. This cannot be undone.
                <br /><br />
                <span className="font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Are you sure?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 flex-col sm:flex-row">
              <AlertDialogCancel className="flex-1 order-2 sm:order-1 border border-gray-300 hover:bg-gray-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowResetDialog(false);
                  handleResetAllStats();
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PHADataManager;
