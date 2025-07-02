
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

const PHADataManager: React.FC = () => {
  const { 
    isImporting, 
    importProgress, 
    importResult, 
    importCSVData, 
    setImportResult 
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

  const handleFileImport = async (file: File) => {
    setImportResult(null);
    
    try {
      const result = await importCSVData(file);
      setLastImport(new Date());
      
      // Update stats with import results
      if (result && result.processedCount !== undefined) {
        const recordsAdded = result.processedCount || 0;
        const recordsEdited = result.errorCount || 0;
        addFileUpload(file.name, recordsAdded, recordsEdited);
      }
      
      await fetchPHACount();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            HUD PHA Data Management
          </CardTitle>
          <Button
            onClick={resetStats}
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
        <PHAStatsCard 
          totalPHAs={totalPHAs} 
          lastImport={lastImport}
          totals={getTotals()}
        />
        
        <ImportProgressComponent 
          importProgress={importProgress} 
          isImporting={isImporting} 
        />

        <ImportControls
          isImporting={isImporting}
          importProgress={importProgress}
          onFileSelect={handleFileImport}
        />

        <ImportResults importResult={importResult} />

        <PHAUploadsTable uploads={importStats.fileUploads} />

        <HUDFormatInfo />
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
