
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, Download, RotateCcw, FileText, Shield, Lock, Eye, AlertCircle } from "lucide-react";
import { FieldMappingModal } from "./PHADataManager/components/FieldMappingModal";

const PHADataManager: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setIsImportModalOpen(true);
    }
  };

  const handleImportClick = () => {
    // Create a hidden file input and trigger it
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = handleFileUpload;
    fileInput.click();
  };

  const handleCloseModal = () => {
    setIsImportModalOpen(false);
    setSelectedFile(null);
  };

  const statsData = [
    {
      title: "Total PHAs",
      value: "0",
      description: "Active housing authorities",
      icon: Database,
      color: "text-blue-600"
    },
    {
      title: "Files Imported",
      value: "0",
      description: "CSV files processed",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Records Added",
      value: "0",
      description: "New PHA records",
      icon: Upload,
      color: "text-purple-600"
    },
    {
      title: "Records Updated",
      value: "0",
      description: "Modified records",
      icon: RotateCcw,
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          HUD PHA Data Management
        </CardTitle>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Stats
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security & Privacy Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                <strong>Data Security:</strong> All data modifications require authentication and are logged for security monitoring.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                <strong>Public Data:</strong> PHA contact information is public data and can be viewed by anyone. No personal information is stored.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                <strong>Data Import:</strong> CSV imports are limited to 50MB and 100,000 records for security and performance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Security Notice</h3>
                <p className="text-sm text-yellow-700">
                  Data imports now require authentication and are subject to enhanced security validation. Files are limited to 50MB and 100,000 records maximum.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleImportClick}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-base font-medium"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import HUD CSV File (Authentication Required)
          </Button>

          <Button variant="outline" className="w-full py-3 text-base font-medium">
            <Download className="w-5 h-5 mr-2" />
            Download HUD Format Sample
          </Button>
        </div>

        {/* Upload Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>
            Upload HUD PHA Contact Information CSV data. The system automatically maps HUD field names like PARTICIPANT_CODE, FORMAL_PARTICIPANT_NAME, STD_ADDR, LAT/LON, etc.
          </p>
          <p className="font-medium">
            Note: Authentication is required for data imports.
          </p>
        </div>

        {/* File Upload History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Upload History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No file uploads recorded yet
              </h3>
              <p className="text-gray-500">
                Upload CSV files to see detailed statistics here
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>

      {/* Field Mapping Modal */}
      <FieldMappingModal 
        isOpen={isImportModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
      />
    </Card>
  );
};

export default PHADataManager;
