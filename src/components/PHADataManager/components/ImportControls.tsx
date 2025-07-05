
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Download, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImportProgress } from '../types';
import { supabase } from "@/integrations/supabase/client";

interface ImportControlsProps {
  isImporting: boolean;
  importProgress: ImportProgress;
  onFileSelect: (file: File) => void;
}

export const ImportControls: React.FC<ImportControlsProps> = ({ 
  isImporting, 
  importProgress, 
  onFileSelect 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const progressPercentage = importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Enhanced security validation
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const allowedExtensions = ['.csv', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file only",
        variant: "destructive",
      });
      return;
    }

    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    // Check authentication before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to import data",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
    
    // Reset file input to allow re-selecting the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `PARTICIPANT_CODE,FORMAL_PARTICIPANT_NAME,STD_ADDR,STD_CITY,STD_ST,STD_ZIP5,HA_PHN_NUM,HA_EMAIL_ADDR_TEXT,EXEC_DIR_EMAIL,HA_PROGRAM_TYPE
CA001,Los Angeles Housing Authority,2600 Wilshire Blvd,Los Angeles,CA,90057,(213) 252-2500,info@hacla.org,director@hacla.org,Section 8
NY002,New York City Housing Authority,250 Broadway,New York,NY,10007,(212) 306-3000,contact@nycha.nyc.gov,ceo@nycha.nyc.gov,Public Housing
TX003,Houston Housing Authority,2640 Fountain View Dr,Houston,TX,77057,(713) 260-0500,info@housingforhouston.com,president@housingforhouston.com,Mixed Income`;
    
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

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Security Notice</span>
        </div>
        <p className="text-xs text-amber-700">
          Data imports now require authentication and are subject to enhanced security validation. 
          Files are limited to 50MB and 100,000 records maximum.
        </p>
      </div>
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="w-full flex items-center gap-2"
        size="lg"
      >
        <Upload className="w-4 h-4" />
        {isImporting ? `Importing HUD Data... (${Math.round(progressPercentage)}%)` : 'Import HUD CSV File (Authentication Required)'}
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
        Upload HUD PHA Contact Information CSV data. The system automatically maps these fields:
        <br />
        <strong>PARTICIPANT_CODE → PHA Code</strong>, <strong>FORMAL_PARTICIPANT_NAME → Name</strong>, <strong>STD_ADDR+STD_CITY+STD_ST+STD_ZIP5 → Address</strong>
        <br />
        <strong>HA_PHN_NUM → Phone</strong>, <strong>HA_EMAIL_ADDR_TEXT → Email</strong>, <strong>EXEC_DIR_EMAIL → Executive Director Email</strong>
        <br />
        <strong>HA_PROGRAM_TYPE → Program Type</strong>
        <br />
        <strong>Note:</strong> Authentication is required for data imports.
      </p>
    </div>
  );
};
