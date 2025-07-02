
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImportProgress } from '../types';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.csv'))) {
      onFileSelect(file);
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

  return (
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
        {isImporting ? `Importing HUD Data... (${Math.round(progressPercentage)}%)` : 'Import HUD CSV File'}
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
  );
};
