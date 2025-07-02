
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { usePHAImport } from "./PHADataManager/hooks/usePHAImport";
import { usePHACount } from "./PHADataManager/hooks/usePHACount";
import { PHAStatusCard } from "./PHADataManager/components/PHAStatusCard";
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

  const handleFileImport = async (file: File) => {
    setImportResult(null);
    try {
      await importCSVData(file);
      setLastImport(new Date());
      await fetchPHACount();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          HUD PHA Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PHAStatusCard totalPHAs={totalPHAs} lastImport={lastImport} />
        
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

        <HUDFormatInfo />
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
