
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Download, Shield, FileCheck, AlertTriangle, Info } from "lucide-react";
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
    const sampleData = `PARTICIPANT_CODE,FORMAL_PARTICIPANT_NAME,FULL_ADDRESS,HA_PHN_NUM,HA_EMAIL_ADDR_TEXT,EXEC_DIR_EMAIL,HA_PROGRAM_TYPE
CA001,Los Angeles Housing Authority,"2600 Wilshire Blvd, Los Angeles, CA, 90057",(213) 252-2500,info@hacla.org,director@hacla.org,Section 8
NY002,New York City Housing Authority,"250 Broadway, New York, NY, 10007",(212) 306-3000,contact@nycha.nyc.gov,ceo@nycha.nyc.gov,Public Housing
TX003,Houston Housing Authority,"2640 Fountain View Dr, Houston, TX, 77057",(713) 260-0500,info@housingforhouston.com,president@housingforhouston.com,Mixed Income`;
    
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
    <div className="space-y-4 sm:space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Mobile-First Security Notice */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 to-orange-100/30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-md sm:rounded-lg shadow-md">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-amber-900">Security Notice</h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            Data imports require <span className="font-semibold">authentication</span> and are limited to 
            <span className="font-semibold"> 50MB</span> and <span className="font-semibold">100,000 records</span>.
          </p>
        </div>
      </div>
      
      {/* Mobile-First Import Actions */}
      <div className="space-y-3 sm:space-y-4">
        {/* Primary Import Button */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="relative w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-70"
            size="lg"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-white/20 rounded-md sm:rounded-lg">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm sm:text-base font-bold truncate">
                  {isImporting ? `Processing... ${Math.round(progressPercentage)}%` : 'Import HUD CSV File'}
                </div>
                <div className="text-xs opacity-90 hidden sm:block">Authentication Required</div>
              </div>
            </div>
            {isImporting && (
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-white transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </Button>
        </div>

        {/* Secondary Download Button */}
        <Button
          onClick={downloadSampleCSV}
          variant="outline"
          className="w-full h-10 sm:h-12 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
          size="lg"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-gray-100 rounded-md sm:rounded-lg">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Download Sample CSV</div>
              <div className="text-xs text-gray-600 hidden sm:block">Template with example data</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Mobile-First Field Mapping Information */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1 sm:p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md sm:rounded-lg shadow-md">
            <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Automatic Field Mapping</h3>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            The system automatically maps HUD PHA Contact Information CSV fields:
          </p>
          
          {/* Mobile-Optimized Field Mapping Cards */}
          <div className="space-y-2">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">PARTICIPANT_CODE</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">PHA Code</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">FORMAL_PARTICIPANT_NAME</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Name</span>
                </div>
              </div>
            </div>
            
            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">FULL_ADDRESS</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Address</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">HA_PHN_NUM</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Phone</span>
                </div>
              </div>
            </div>
            
            {/* Row 3 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">HA_EMAIL_ADDR_TEXT</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Email</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">EXEC_DIR_EMAIL</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Director Email</span>
                </div>
              </div>
            </div>
            
            {/* Row 4 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                  <span className="font-mono text-xs text-slate-600 truncate">HA_PROGRAM_TYPE</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-semibold text-xs text-slate-800">Program Type</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-md sm:rounded-lg border border-blue-200">
          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <span className="font-semibold">Note:</span> Authentication required. Both tab and comma-separated formats supported.
          </div>
        </div>
      </div>
    </div>
  );
};
