
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
    const sampleData = `PARTICIPANT_CODE,FORMAL_PARTICIPANT_NAME,FULL_ADDRESS,HA_PHN_NUM,HA_FAX_NUM,HA_EMAIL_ADDR_TEXT,EXEC_DIR_PHONE,EXEC_DIR_FAX,EXEC_DIR_EMAIL,PHAS_DESIGNATION,HA_PROGRAM_TYPE,HA_LOW_RENT_SIZE_CATEGORY,HA_SECTION_8_SIZE_CATEGORY,HA_COMBINED_SIZE_CATEGORY,HA_FYE,TOTAL_UNITS,TOTAL_DWELLING_UNITS,PH_OCCUPIED,SECTION8_UNITS_CNT,SECTION8_OCCUPIED
CA001,Sample Housing Authority,123 Main St Los Angeles CA 90210,555-123-4567,555-123-4568,info@sample.gov,555-123-4569,555-123-4570,director@sample.gov,High Performer,Both,Large,Large,Large,12/31,1500,1200,1100,800,750
NY002,Another PHA,456 Oak Ave New York NY 10001,555-987-6543,555-987-6544,contact@another.gov,555-987-6545,555-987-6546,exec@another.gov,Standard Performer,Section 8,Medium,Large,Large,06/30,2000,1800,1600,1200,1150`;
    
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
          Files are limited to 50MB and 100,000 records maximum. HUD field mapping is automatic.
        </p>
      </div>
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="w-full flex items-center gap-2"
        size="lg"
      >
        <Upload className="w-4 h-4" />
        {isImporting ? `Processing HUD Data... (${Math.round(progressPercentage)}%)` : 'Import HUD CSV File'}
      </Button>

      <Button
        onClick={downloadSampleCSV}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download HUD Format Sample CSV
      </Button>

      <div className="text-xs text-gray-600 text-center space-y-2">
        <p>
          Upload HUD PHA Contact Information CSV data. The system automatically processes all HUD standard fields:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-left bg-gray-50 p-3 rounded">
          <div>
            <strong>📋 Code & Name:</strong><br />
            • PARTICIPANT_CODE<br />
            • FORMAL_PARTICIPANT_NAME
          </div>
          <div>
            <strong>📍 Address:</strong><br />
            • FULL_ADDRESS
          </div>
          <div>
            <strong>☎️ Contact Info:</strong><br />
            • HA_PHN_NUM, HA_FAX_NUM<br />
            • HA_EMAIL_ADDR_TEXT<br />
            • EXEC_DIR_PHONE/FAX/EMAIL
          </div>
          <div>
            <strong>🏢 PHA Details:</strong><br />
            • PHAS_DESIGNATION<br />
            • HA_PROGRAM_TYPE<br />
            • Size categories & units
          </div>
        </div>
        <p className="text-amber-700">
          <strong>Note:</strong> Authentication required for imports. All 20 HUD fields supported automatically.
        </p>
      </div>
    </div>
  );
};
