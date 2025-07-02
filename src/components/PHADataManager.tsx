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

  // Parse CSV data with better delimiter detection
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    console.log('Total lines in CSV:', lines.length);
    console.log('First line (headers):', lines[0]);
    
    // Try to detect delimiter (tab or comma)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    console.log('Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');
    
    // Parse headers
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    console.log('Headers found:', headers);
    
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }

    console.log('Parsed data sample:', data.slice(0, 2));
    return data;
  };

  // Import PHA data from CSV
  const importCSVData = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const csvText = await file.text();
      const csvData = parseCSV(csvText);
      
      console.log('Total records to process:', csvData.length);
      
      let processedCount = 0;
      let errorCount = 0;

      for (const record of csvData) {
        try {
          console.log('Processing record:', record);
          
          // Map comprehensive CSV fields to database fields with more flexible field mapping
          const phaData = {
            pha_code: record.PARTICIPANT_CODE || record.pha_code || record.code || null,
            name: record.FORMAL_PARTICIPANT_NAME || record.name || record.PARTICIPANT_NAME || record.PHA_NAME || null,
            address: record.STD_ADDR || record.address || record.ADDRESS || null,
            city: record.STD_CITY || record.city || record.CITY || null,
            state: (record.STD_ST || record.state || record.STATE)?.substring(0, 2) || null,
            zip: (record.STD_ZIP5 || record.zip || record.ZIP)?.substring(0, 10) || null,
            phone: record.HA_PHN_NUM || record.phone || record.PHONE || null,
            email: record.HA_EMAIL_ADDR_TEXT || record.EXEC_DIR_EMAIL || record.email || record.EMAIL || null,
            website: record.website || record.WEBSITE || null,
            supports_hcv: record.HA_PROGRAM_TYPE?.includes('Section 8') || 
                         (record.SECTION8_UNITS_CNT && parseInt(record.SECTION8_UNITS_CNT) > 0) || 
                         record.supports_hcv === 'true' || 
                         false,
            waitlist_status: record.waitlist_status || record.WAITLIST_STATUS || 'Unknown',
            latitude: record.LAT ? parseFloat(record.LAT) : (record.latitude ? parseFloat(record.latitude) : null),
            longitude: record.LON ? parseFloat(record.LON) : (record.longitude ? parseFloat(record.longitude) : null),
            last_updated: new Date().toISOString()
          };

          console.log('Mapped PHA data:', phaData);

          // More lenient validation - only require name
          if (phaData.name && phaData.name.trim().length > 0) {
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
              console.log('Successfully processed record for:', phaData.name);
            }
          } else {
            console.log('Skipping record due to missing name:', record);
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
        title: "Import Completed",
        description: `Processed ${processedCount} PHA records from CSV data`,
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
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.csv'))) {
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
    const sampleData = `PARTICIPANT_CODE,FORMAL_PARTICIPANT_NAME,STD_ADDR,STD_CITY,STD_ST,STD_ZIP5,HA_PHN_NUM,HA_EMAIL_ADDR_TEXT,HA_PROGRAM_TYPE,LAT,LON
CA001,Sample Housing Authority,123 Main St,Los Angeles,CA,90210,555-123-4567,info@sample.gov,Section 8,34.0522,-118.2437
NY002,Another PHA,456 Oak Ave,New York,NY,10001,555-987-6543,contact@another.gov,Public Housing,40.7128,-74.0060`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hud_pha_sample.csv';
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
          HUD PHA Data Management
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
            accept=".csv,.txt"
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
            {isImporting ? 'Importing HUD Data...' : 'Import HUD CSV File'}
          </Button>

          <Button
            onClick={downloadSampleCSV}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download HUD Format Sample
          </Button>

          <p className="text-xs text-gray-600 text-center">
            Upload HUD PHA Contact Information CSV data. The system automatically maps HUD field names
            like PARTICIPANT_CODE, FORMAL_PARTICIPANT_NAME, STD_ADDR, LAT/LON, etc.
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

        {/* HUD Format Information */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            HUD CSV Format Mapping
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>PARTICIPANT_CODE</strong> → PHA Code</li>
            <li>• <strong>FORMAL_PARTICIPANT_NAME</strong> → PHA Name</li>
            <li>• <strong>STD_ADDR, STD_CITY, STD_ST, STD_ZIP5</strong> → Address</li>
            <li>• <strong>HA_PHN_NUM</strong> → Phone Number</li>
            <li>• <strong>HA_EMAIL_ADDR_TEXT, EXEC_DIR_EMAIL</strong> → Email</li>
            <li>• <strong>LAT, LON</strong> → Coordinates for mapping</li>
            <li>• <strong>HA_PROGRAM_TYPE, SECTION8_UNITS_CNT</strong> → Section 8 support</li>
            <li>• Tab-separated or comma-separated formats supported</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
