
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RotateCcw, Shield, Zap, TrendingUp, Activity } from "lucide-react";
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
      {/* Mobile-First Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-blue-100 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col space-y-3 sm:space-y-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                    HUD PHA Data Management
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 line-clamp-2">
                    Advanced data management platform for Public Housing Authority records
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-200 text-xs px-2 sm:px-3 py-1.5 sm:py-2 h-auto flex-shrink-0"
                disabled={isImporting}
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>

            {/* Mobile-First Feature Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Secure</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-green-200">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Real-time</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <SecurityNotice />
        
        {/* Enhanced Stats Cards */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Database Statistics</h2>
          </div>
          <PHAStatsCard 
            totalPHAs={totalPHAs || 0} 
            lastImport={lastImport}
            totals={totals}
          />
        </div>

        {/* Import Progress Section */}
        {isImporting && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg animate-pulse">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Import Progress</h2>
            </div>
            <ImportProgressComponent 
              importProgress={importProgress || { current: 0, total: 0 }} 
              isImporting={isImporting || false} 
            />
          </div>
        )}

        {/* Import Controls Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Data Import Controls</h2>
          </div>
          <ImportControls
            isImporting={isImporting || false}
            importProgress={importProgress || { current: 0, total: 0 }}
            onFileSelect={handleFileImport}
          />
        </div>

        <ImportResults importResult={importResult} />

        {/* Upload History Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Import History</h2>
          </div>
          <PHAUploadsTable uploads={importStats?.fileUploads || []} />
        </div>

        <FieldMappingDialog
          open={showMappingDialog}
          onOpenChange={setShowMappingDialog}
          csvHeaders={csvHeaders}
          onMappingConfirm={handleMappingComplete}
        />

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent className="max-w-sm sm:max-w-md mx-3 sm:mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
                Reset All Data
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 leading-relaxed text-sm">
                This will permanently delete all PHA records and statistics. This cannot be undone.
                <br /><br />
                <span className="font-semibold text-red-600">Are you sure?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 flex-col sm:flex-row">
              <AlertDialogCancel className="flex-1 order-2 sm:order-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowResetDialog(false);
                  handleResetAllStats();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold order-1 sm:order-2"
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
