import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface UploadProgress {
  total: number;
  processed: number;
  errors: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  startTime?: number;
}

const PropertyDataManager: React.FC = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    errors: 0,
    status: 'idle',
    startTime: undefined
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLIHTCFormat, setIsLIHTCFormat] = useState(false);
  
  // Debug: Log when component renders
  console.log('PropertyDataManager rendered, uploadProgress:', uploadProgress);
  
  // TEMPORARY: Test progress bar - Remove this after testing
  const testProgressBar = () => {
    setUploadProgress({
      total: 1000,
      processed: 450,
      errors: 23,
      status: 'processing',
      startTime: Date.now()
    });
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadProgress({ total: 0, processed: 0, errors: 0, status: 'idle' });
      // Check if it's LIHTC format by filename
      setIsLIHTCFormat(file.name.toLowerCase().includes('lihtc') || file.name.toLowerCase().includes('location'));
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };
  
  const downloadTemplate = () => {
    const template = `name,address,city,state,zip,property_type,units_total,units_available,bedroom_types,rent_range_min,rent_range_max,waitlist_open,phone,email,website,latitude,longitude,year_put_in_service,low_income_units,units_studio,units_1br,units_2br,units_3br,units_4br
"Sample Property","123 Main St","New York","NY","10001","tax_credit",100,25,"studio;1br;2br",800,1500,true,"(555) 123-4567","info@property.com","https://property.com",40.7128,-74.0060,2020,80,10,30,40,15,5`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template downloaded",
      description: "Use this template to format your property data",
    });
  };
  
  // Parse LIHTC format
  const parseLIHTCData = (headers: string[], values: string[]): any => {
    const getValue = (fieldName: string) => {
      const index = headers.indexOf(fieldName);
      return index >= 0 ? values[index]?.trim().replace(/^"|"$/g, '') || '' : '';
    };
    
    // Debug logging for problematic fields
    console.log('LIHTC Parser Debug:', {
      projectName: getValue('project'),
      yr_pis: getValue('yr_pis'),
      li_units: getValue('li_units'),
      n_0br: getValue('n_0br'),
      n_1br: getValue('n_1br'),
      n_2br: getValue('n_2br'),
      n_3br: getValue('n_3br'),
      n_4br: getValue('n_4br'),
      headers_length: headers.length,
      values_length: values.length
    });
    
    // Determine property type based on various factors
    let propertyType = 'tax_credit'; // Default for LIHTC
    const type = getValue('type');
    if (type === '1') propertyType = 'public_housing';
    else if (type === '2') propertyType = 'tax_credit';
    else if (type === '3') propertyType = 'section_8';
    
    // Build bedroom types array
    const bedroomTypes: string[] = [];
    if (parseInt(getValue('n_0br')) > 0) bedroomTypes.push('studio');
    if (parseInt(getValue('n_1br')) > 0) bedroomTypes.push('1br');
    if (parseInt(getValue('n_2br')) > 0) bedroomTypes.push('2br');
    if (parseInt(getValue('n_3br')) > 0) bedroomTypes.push('3br');
    if (parseInt(getValue('n_4br')) > 0) bedroomTypes.push('4br+');
    
    // Parse coordinates
    const lat = parseFloat(getValue('latitude'));
    const lng = parseFloat(getValue('longitude'));
    
    // Parse and validate year
    const yearValue = parseInt(getValue('yr_pis'));
    const currentYear = new Date().getFullYear();
    // Only accept years between 1900 and current year + 5
    const validYear = yearValue && yearValue >= 1900 && yearValue <= currentYear + 5 ? yearValue : null;
    
    return {
      name: getValue('project') || getValue('google_name'),
      address: getValue('proj_add'),
      city: getValue('proj_cty'),
      state: getValue('proj_st'),
      zip: getValue('proj_zip'),
      property_type: propertyType,
      units_total: parseInt(getValue('n_units')) || null,
      units_available: null, // LIHTC doesn't have this
      bedroom_types: bedroomTypes,
      rent_range_min: null, // Would need to calculate based on area
      rent_range_max: null,
      waitlist_open: null,
      phone: getValue('phone') || null,
      email: null, // Not in LIHTC data
      website: getValue('website') || null,
      latitude: !isNaN(lat) ? lat : null,
      longitude: !isNaN(lng) ? lng : null,
      // Add new LIHTC fields with validation
      year_put_in_service: validYear,
      low_income_units: parseInt(getValue('li_units')) || null,
      units_studio: parseInt(getValue('n_0br')) || 0,
      units_1br: parseInt(getValue('n_1br')) || 0,
      units_2br: parseInt(getValue('n_2br')) || 0,
      units_3br: parseInt(getValue('n_3br')) || 0,
      units_4br: parseInt(getValue('n_4br')) || 0,
      // Store some LIHTC-specific data in a metadata field if needed
      pha_id: null // No PHA association in LIHTC data
    };
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploadProgress({ total: 0, processed: 0, errors: 0, status: 'uploading', startTime: Date.now() });
    
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // For large files, show total count
      const totalRecords = lines.length - 1; // Minus header
      console.log(`📊 Processing ${totalRecords.toLocaleString()} property records...`);
      
      // Detect if this is LIHTC format
      const isLIHTC = headers.includes('hud_id') || headers.includes('project');
      
      // Process in chunks to avoid memory issues
      const chunkSize = 5000; // Process 5k records at a time
      const batchSize = 50; // Reduced from 100 for better reliability
      let allProcessed = 0;
      let allErrors = 0;
      
      setUploadProgress(prev => ({ ...prev, total: totalRecords }));
      
      // Process file in chunks
      for (let chunkStart = 1; chunkStart < lines.length; chunkStart += chunkSize) {
        const chunkEnd = Math.min(chunkStart + chunkSize, lines.length);
        const properties: any[] = [];
        
        // Parse chunk
        for (let i = chunkStart; i < chunkEnd; i++) {
          const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
          let property: any = {};
          
          if (isLIHTC) {
            // Use LIHTC parser
            property = parseLIHTCData(headers, values.map(v => v.trim()));
          } else {
            // Use standard parser
            headers.forEach((header, index) => {
              let value = values[index]?.trim().replace(/^"|"$/g, '') || '';
              
              // Parse specific fields
              if (header === 'units_total' || header === 'units_available' || 
                  header === 'low_income_units' ||
                  header === 'units_studio' || header === 'units_1br' || 
                  header === 'units_2br' || header === 'units_3br' || header === 'units_4br') {
                property[header] = value ? parseInt(value) : null;
              } else if (header === 'year_put_in_service') {
                // Validate year
                const yearValue = value ? parseInt(value) : null;
                const currentYear = new Date().getFullYear();
                property[header] = yearValue && yearValue >= 1900 && yearValue <= currentYear + 5 ? yearValue : null;
              } else if (header === 'rent_range_min' || header === 'rent_range_max') {
                property[header] = value ? parseFloat(value) : null;
              } else if (header === 'waitlist_open') {
                property[header] = value.toLowerCase() === 'true';
              } else if (header === 'bedroom_types') {
                property[header] = value ? value.split(';').map(t => t.trim()) : [];
              } else if (header === 'latitude' || header === 'longitude') {
                property[header] = value ? parseFloat(value) : null;
              } else {
                property[header] = value || null;
              }
            });
          }
          
          // Only add properties with valid data
          if (property.name && property.address) {
            properties.push(property);
          }
        }
        
        // Upload chunk in batches
        for (let i = 0; i < properties.length; i += batchSize) {
          const batch = properties.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('properties')
              .upsert(batch, { 
                onConflict: 'name,address',
                ignoreDuplicates: false 
              });
            
            if (error) {
              console.error('Batch upload error:', error);
              allErrors += batch.length;
            } else {
              allProcessed += batch.length;
            }
          } catch (err) {
            console.error('Batch failed:', err);
            allErrors += batch.length;
          }
          
          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            processed: allProcessed + allErrors,
            errors: allErrors
          }));
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Free memory after each chunk
        properties.length = 0;
      }
      
      setUploadProgress(prev => ({ ...prev, status: 'complete' }));
      
      const message = totalRecords > 10000 
        ? `🎉 Large dataset processed! Successfully uploaded ${allProcessed.toLocaleString()} of ${totalRecords.toLocaleString()} properties.`
        : `Successfully uploaded ${allProcessed} properties.`;
      
      toast({
        title: "Upload complete",
        description: `${message} ${allErrors > 0 ? `${allErrors} errors.` : ''}`,
        variant: allErrors > 0 ? "destructive" : "default"
      });
      
      // Reset file selection
      setSelectedFile(null);
      setIsLIHTCFormat(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Upload failed",
        description: error instanceof Error && error.message.includes('memory') 
          ? "File too large. Try splitting into smaller files (max 20,000 records each)."
          : "An error occurred while uploading properties",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Property Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="property-file-upload"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
              >
                <span className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Drop CSV file or click to upload'}
                  </span>
                  {isLIHTCFormat && (
                    <span className="text-xs text-green-600 font-semibold">
                      LIHTC format detected ✓
                    </span>
                  )}
                </span>
                <input
                  id="property-file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadProgress.status === 'uploading' || uploadProgress.status === 'processing'}
                className={`bg-red-600 hover:bg-red-700 ${
                  uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' 
                    ? 'opacity-75 cursor-not-allowed' 
                    : ''
                }`}
              >
                {uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {uploadProgress.status === 'uploading' ? 'Reading...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Properties
                  </>
                )}
              </Button>
              
              <Button
                onClick={downloadTemplate}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              
              {/* TEMPORARY TEST BUTTON - REMOVE AFTER TESTING */}
              <Button
                onClick={testProgressBar}
                variant="outline"
                className="border-purple-500 text-purple-500"
              >
                Test Progress Bar
              </Button>
            </div>
          </div>
          
          {/* Progress Display */}
          {uploadProgress.status !== 'idle' && (
            <div className="space-y-2">
              <Alert className={uploadProgress.status === 'error' ? 'border-red-500' : uploadProgress.status === 'complete' ? 'border-green-500' : ''}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadProgress.status === 'uploading' && 'Reading and preparing file...'}
                  {uploadProgress.status === 'processing' && 
                    `Processing: ${uploadProgress.processed.toLocaleString()} / ${uploadProgress.total.toLocaleString()} properties`}
                  {uploadProgress.status === 'complete' && 
                    `Complete! ${(uploadProgress.processed - uploadProgress.errors).toLocaleString()} properties uploaded successfully.`}
                  {uploadProgress.status === 'error' && 'Upload failed. Please try again.'}
                  {uploadProgress.errors > 0 && ` (${uploadProgress.errors.toLocaleString()} errors)`}
                </AlertDescription>
              </Alert>
              
              {/* Visual Progress Bar */}
              {(uploadProgress.status === 'processing' || uploadProgress.status === 'uploading') && uploadProgress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Upload Progress</span>
                    <span>{Math.round((uploadProgress.processed / uploadProgress.total) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(uploadProgress.processed / uploadProgress.total) * 100} 
                    className={`h-3 ${uploadProgress.status === 'processing' ? 'animate-pulse' : ''}`}
                  />
                  {uploadProgress.status === 'processing' && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Processing batch {Math.floor(uploadProgress.processed / 50) + 1} of {Math.ceil(uploadProgress.total / 50)}
                      </span>
                      {uploadProgress.startTime && uploadProgress.processed > 0 && (
                        <span>
                          {(() => {
                            const elapsed = Date.now() - uploadProgress.startTime;
                            const rate = uploadProgress.processed / (elapsed / 1000);
                            const remaining = (uploadProgress.total - uploadProgress.processed) / rate;
                            const minutes = Math.floor(remaining / 60);
                            const seconds = Math.floor(remaining % 60);
                            return remaining > 0 ? `Est. time remaining: ${minutes}m ${seconds}s` : '';
                          })()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Success checkmark */}
              {uploadProgress.status === 'complete' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload completed successfully!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Large File Tips */}
      {selectedFile && selectedFile.size > 10 * 1024 * 1024 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Large file detected!</strong> For files with 50,000+ records:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload may take 10-15 minutes</li>
              <li>Keep this tab open during upload</li>
              <li>Progress updates every 50 properties</li>
              <li>If it fails, try splitting into smaller files</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Format Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold mb-2">LIHTC Format (Auto-detected)</p>
              <p>If your data has these columns, we'll automatically map them:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>hud_id</code>, <code>project</code>, <code>proj_add</code>, <code>proj_cty</code>, <code>proj_st</code>, <code>proj_zip</code></li>
                <li><code>n_units</code>, <code>n_0br</code>, <code>n_1br</code>, <code>n_2br</code>, <code>n_3br</code>, <code>n_4br</code></li>
                <li><code>yr_pis</code> (Year Put in Service), <code>li_units</code> (Low Income Units)</li>
                <li><code>latitude</code>, <code>longitude</code>, <code>phone</code>, <code>website</code></li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-2">Standard Format</p>
              <p>Or use our standard format with these columns:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>name</code>, <code>address</code>, <code>city</code>, <code>state</code>, <code>zip</code></li>
                <li><code>property_type</code> - Type: tax_credit, section_8, public_housing</li>
                <li><code>units_total</code>, <code>units_available</code></li>
                <li><code>bedroom_types</code> - Semicolon-separated: studio;1br;2br</li>
                <li><code>rent_range_min</code>, <code>rent_range_max</code></li>
                <li><code>waitlist_open</code> - true/false</li>
                <li><code>phone</code>, <code>email</code>, <code>website</code></li>
                <li><code>latitude</code>, <code>longitude</code></li>
                <li><code>year_put_in_service</code>, <code>low_income_units</code></li>
                <li><code>units_studio</code>, <code>units_1br</code>, <code>units_2br</code>, <code>units_3br</code>, <code>units_4br</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDataManager; 