import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface UploadProgress {
  total: number;
  processed: number;
  errors: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
}

const PropertyDataManager: React.FC = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    errors: 0,
    status: 'idle'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadProgress({ total: 0, processed: 0, errors: 0, status: 'idle' });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };
  
  const downloadTemplate = () => {
    const template = `name,address,city,state,zip,property_type,units_total,units_available,bedroom_types,rent_range_min,rent_range_max,waitlist_open,phone,email,website,latitude,longitude
"Sample Property","123 Main St","New York","NY","10001","tax_credit",100,25,"studio;1br;2br",800,1500,true,"(555) 123-4567","info@property.com","https://property.com",40.7128,-74.0060`;
    
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
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploadProgress({ total: 0, processed: 0, errors: 0, status: 'uploading' });
    
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const properties = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
        const property: any = {};
        
        headers.forEach((header, index) => {
          let value = values[index]?.trim().replace(/^"|"$/g, '') || '';
          
          // Parse specific fields
          if (header === 'units_total' || header === 'units_available') {
            property[header] = value ? parseInt(value) : null;
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
        
        properties.push(property);
      }
      
      setUploadProgress(prev => ({ ...prev, total: properties.length, status: 'processing' }));
      
      // Upload in batches
      const batchSize = 100;
      let processed = 0;
      let errors = 0;
      
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('properties')
          .upsert(batch, { 
            onConflict: 'name,address', // Adjust based on your unique constraints
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error('Batch upload error:', error);
          errors += batch.length;
        } else {
          processed += batch.length;
        }
        
        setUploadProgress(prev => ({
          ...prev,
          processed: processed + errors,
          errors
        }));
      }
      
      setUploadProgress(prev => ({ ...prev, status: 'complete' }));
      
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${processed} properties. ${errors} errors.`,
        variant: errors > 0 ? "destructive" : "default"
      });
      
      // Reset file selection
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading properties",
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
                className="bg-red-600 hover:bg-red-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Properties
              </Button>
              
              <Button
                onClick={downloadTemplate}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>
          
          {/* Progress Display */}
          {uploadProgress.status !== 'idle' && (
            <Alert className={uploadProgress.status === 'error' ? 'border-red-500' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadProgress.status === 'uploading' && 'Reading file...'}
                {uploadProgress.status === 'processing' && 
                  `Processing: ${uploadProgress.processed} / ${uploadProgress.total} properties`}
                {uploadProgress.status === 'complete' && 
                  `Complete! ${uploadProgress.processed - uploadProgress.errors} properties uploaded successfully.`}
                {uploadProgress.status === 'error' && 'Upload failed. Please try again.'}
                {uploadProgress.errors > 0 && ` (${uploadProgress.errors} errors)`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold">Required columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>name</code> - Property name</li>
              <li><code>address</code> - Street address</li>
              <li><code>city</code> - City name</li>
              <li><code>state</code> - 2-letter state code</li>
              <li><code>zip</code> - ZIP code</li>
            </ul>
            
            <p className="font-semibold mt-4">Optional columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>property_type</code> - Type: tax_credit, section_8, public_housing</li>
              <li><code>units_total</code> - Total number of units</li>
              <li><code>units_available</code> - Number of available units</li>
              <li><code>bedroom_types</code> - Semicolon-separated: studio;1br;2br</li>
              <li><code>rent_range_min</code> - Minimum rent amount</li>
              <li><code>rent_range_max</code> - Maximum rent amount</li>
              <li><code>waitlist_open</code> - true/false</li>
              <li><code>phone</code>, <code>email</code>, <code>website</code> - Contact info</li>
              <li><code>latitude</code>, <code>longitude</code> - GPS coordinates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDataManager;
