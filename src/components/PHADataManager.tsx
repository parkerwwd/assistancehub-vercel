
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, AlertCircle, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportResult {
  success: boolean;
  processedCount?: number;
  errorCount?: number;
  message?: string;
  error?: string;
}

const PHADataManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [lastImport, setLastImport] = useState<Date | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [totalPHAs, setTotalPHAs] = useState<number>(0);
  const { toast } = useToast();

  // Fetch current count of PHAs in database
  const fetchPHACount = async () => {
    try {
      const { count, error } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalPHAs(count || 0);
    } catch (error) {
      console.error('Error fetching PHA count:', error);
    }
  };

  // Import PHA data from HUD API
  const importPHAData = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-pha-data', {
        method: 'POST'
      });

      if (error) throw error;

      setImportResult(data);
      setLastImport(new Date());
      
      if (data.success) {
        toast({
          title: "Import Successful",
          description: `Processed ${data.processedCount} PHA records`,
        });
        await fetchPHACount();
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        error: error.message || 'Failed to import PHA data'
      });
      toast({
        title: "Import Error",
        description: "Failed to connect to import service",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  React.useEffect(() => {
    fetchPHACount();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          PHA Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">PHAs in Database:</span>
            <span className="text-lg font-semibold text-blue-600">{totalPHAs.toLocaleString()}</span>
          </div>
          {lastImport && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {lastImport.toLocaleString()}
            </div>
          )}
        </div>

        {/* Import Controls */}
        <div className="space-y-4">
          <Button
            onClick={importPHAData}
            disabled={isImporting}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isImporting ? 'Importing PHA Data...' : 'Import from HUD API'}
          </Button>

          <p className="text-xs text-gray-600 text-center">
            This will fetch the latest PHA contact information from HUD's official API
            and update the database with current data.
          </p>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className={`p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? 'Import Completed' : 'Import Failed'}
                </h4>
                <p className={`text-sm mt-1 ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.message || importResult.error}
                </p>
                {importResult.success && importResult.processedCount && (
                  <div className="mt-2 text-xs text-green-600">
                    Successfully processed: {importResult.processedCount} records
                    {importResult.errorCount && importResult.errorCount > 0 && (
                      <span className="text-orange-600 ml-2">
                        ({importResult.errorCount} errors)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">About PHA Data</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Data sourced from HUD's official PHA Contact Information API</li>
            <li>• Includes PHA names, addresses, contact info, and HCV participation</li>
            <li>• Data is automatically deduplicated using PHA codes</li>
            <li>• Recommended to refresh monthly for accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
