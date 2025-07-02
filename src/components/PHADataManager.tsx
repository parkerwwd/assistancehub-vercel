
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Database, AlertCircle, CheckCircle, FileText, Download } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Parse CSV data
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }

    return data;
  };

  // Import PHA data from CSV
  const importCSVData = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      let processedCount = 0;
      let errorCount = 0;

      for (const record of csvData) {
        try {
          // Map CSV fields to database fields
          const phaData = {
            pha_code: record.pha_code || record.code || null,
            name: record.name || record.pha_name || 'Unknown PHA',
            address: record.address || record.pha_address || null,
            city: record.city || record.pha_city || null,
            state: record.state || record.pha_state?.substring(0, 2) || null,
            zip: record.zip || record.pha_zip?.substring(0, 10) || null,
            phone: record.phone || record.pha_phone || null,
            email: record.email || record.pha_email || null,
            website: record.website || record.pha_website || null,
            supports_hcv: record.supports_hcv === 'true' || record.hcv_flag === 'Y' || record.hcv_flag === 'YES' || false,
            waitlist_status: record.waitlist_status || 'Unknown',
            latitude: record.latitude ? parseFloat(record.latitude) : null,
            longitude: record.longitude ? parseFloat(record.longitude) : null,
            last_updated: new Date().toISOString()
          };

          // Upsert the record
          const { error } = await supabase
            .from('pha_agencies')
            .upsert(phaData, { 
              onConflict: 'pha_code',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error('Error upserting PHA record:', error);
            errorCount++;
          } else {
            processedCount++;
          }
        } catch (recordError) {
          console.error('Error processing PHA record:', recordError);
          errorCount++;
        }
      }

      setImportResult({
        success: true,
        processedCount,
        errorCount,
        message: `Processed ${processedCount} PHA records, ${errorCount} errors`
      });
      
      setLastImport(new Date());
      toast({
        title: "Import Successful",
        description: `Processed ${processedCount} PHA records`,
      });
      
      await fetchPHACount();
    } catch (error) {
      console.error('CSV Import error:', error);
      setImportResult({
        success: false,
        error: error.message || 'Failed to import CSV data'
      });
      toast({
        title: "Import Error",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      importCSVData(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `pha_code,name,address,city,state,zip,phone,email,website,supports_hcv,waitlist_status,latitude,longitude
CA001,Sample Housing Authority,123 Main St,Los Angeles,CA,90210,555-123-4567,info@sample.gov,www.sampleha.gov,true,Open,34.0522,-118.2437
NY002,Another PHA,456 Oak Ave,New York,NY,10001,555-987-6543,contact@another.gov,www.anotherpha.gov,false,Closed,40.7128,-74.0060`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pha_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

        {/* CSV Import Controls */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing CSV Data...' : 'Import CSV File'}
          </Button>

          <Button
            onClick={downloadSampleCSV}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Sample CSV Template
          </Button>

          <p className="text-xs text-gray-600 text-center">
            Upload a CSV file with PHA data. The system will automatically map common field names
            and update existing records based on PHA codes.
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

        {/* CSV Format Information */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            CSV Format Requirements
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Required:</strong> name (PHA name)</li>
            <li>• <strong>Optional:</strong> pha_code, address, city, state, zip</li>
            <li>• <strong>Optional:</strong> phone, email, website</li>
            <li>• <strong>Optional:</strong> latitude, longitude (for map display)</li>
            <li>• <strong>Optional:</strong> supports_hcv (true/false), waitlist_status</li>
            <li>• Field names are flexible - common variations are auto-mapped</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
