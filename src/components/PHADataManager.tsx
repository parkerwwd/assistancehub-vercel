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
    <div className="w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 mb-8 border border-blue-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                  HUD PHA Data Management
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Advanced data management platform for Public Housing Authority records with real-time processing and analytics
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowResetDialog(true)}
              variant="outline"
              size="lg"
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-200"
              disabled={isImporting}
            >
              <RotateCcw className="w-5 h-5" />
              Reset All Data
            </Button>
          </div>

          {/* Key Features Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Secure Processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-green-200">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Real-time Import</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-orange-200">
              <Activity className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Audit Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <SecurityNotice />
        
        {/* Enhanced Stats Cards */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Database Statistics</h2>
          </div>
          <PHAStatsCard 
            totalPHAs={totalPHAs || 0} 
            lastImport={lastImport}
            totals={totals}
          />
        </div>

        {/* Import Progress Section */}
        {isImporting && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg animate-pulse">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Import Progress</h2>
            </div>
            <ImportProgressComponent 
              importProgress={importProgress || { current: 0, total: 0 }} 
              isImporting={isImporting || false} 
            />
          </div>
        )}

        {/* Import Controls Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Import Controls</h2>
          </div>
          <ImportControls
            isImporting={isImporting || false}
            importProgress={importProgress || { current: 0, total: 0 }}
            onFileSelect={handleFileImport}
          />
        </div>

        <ImportResults importResult={importResult} />

        {/* Upload History Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Import History</h2>
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
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                </div>
                Reset All Data & Statistics
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 leading-relaxed">
                This action will permanently delete all PHA records and import statistics from the database. 
                This operation cannot be undone and will affect all users of the system.
                <br /><br />
                <span className="font-semibold text-red-600">Are you absolutely sure you want to continue?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowResetDialog(false);
                  handleResetAllStats();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Yes, Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PHADataManager;
