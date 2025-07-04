
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
    const sampleData = `PARTICIPANT_CODE,FORMAL_PARTICIPANT_NAME,FULL_ADDRESS,HA_PHN_NUM,HA_FAX_NUM,HA_EMAIL_ADDR_TEXT,EXEC_DIR_PHONE,EXEC_DIR_FAX,EXEC_DIR_EMAIL,PHAS_DESIGNATION,HA_LOW_RENT_SIZE_CATEGORY,SECTION8_UNITS_CNT,HA_SECTION_8_SIZE_CATEGORY,HA_COMBINED_SIZE_CATEGORY,HA_FYE,HA_PROGRAM_TYPE,TOTAL_UNITS,TOTAL_DWELLING_UNITS,ACC_UNITS,PH_OCCUPIED,SECTION8_OCCUPIED,TOTAL_OCCUPIED,PCT_OCCUPIED,REGULAR_VACANT,PHA_TOTAL_UNITS,NUMBER_REPORTED,PCT_REPORTED,OPFUND_AMNT,OPFUND_AMNT_PREV_YR,CAPFUND_AMNT
CA001,Sample Housing Authority,123 Main St Los Angeles CA 90210,555-123-4567,555-123-4568,info@sample.gov,555-123-4569,555-123-4570,director@sample.gov,High Performer,Small,250,Small,Small,12/31/2023,Public Housing,300,280,260,240,200,440,85.5,40,300,280,93.3,1250000.50,1200000.25,500000.75
NY002,Another PHA,456 Oak Ave New York NY 10001,555-987-6543,555-987-6544,contact@another.gov,555-987-6545,555-987-6546,ed@another.gov,Standard,Large,500,Large,Large,06/30/2023,Mixed,750,700,650,600,450,1050,89.2,100,750,700,93.3,2500000.00,2400000.00,1000000.00`;
    
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
        Upload HUD PHA Contact Information CSV data. The system automatically maps HUD field names
        like PARTICIPANT_CODE, FORMAL_PARTICIPANT_NAME, FULL_ADDRESS, HA_PHN_NUM, etc.
        <br />
        <strong>Note:</strong> Authentication is required for data imports.
      </p>
    </div>
  );
};
