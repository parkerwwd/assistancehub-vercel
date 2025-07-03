
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface FieldMapping {
  csvField: string;
  dbField: string;
}

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvHeaders: string[];
  onMappingConfirm: (mappings: FieldMapping[]) => void;
  defaultMappings?: FieldMapping[];
}

const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Street address' },
  { key: 'city', label: 'City', description: 'City name' },
  { key: 'state', label: 'State', description: 'State abbreviation (2 letters)' },
  { key: 'zip', label: 'ZIP Code', description: 'Postal code' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'website', label: 'Website', description: 'Official website URL' },
  { key: 'supports_hcv', label: 'Supports HCV', description: 'Housing Choice Voucher support (Section 8)' },
  { key: 'waitlist_status', label: 'Waitlist Status', description: 'Current waitlist status' },
  { key: 'latitude', label: 'Latitude', description: 'Geographic latitude coordinate' },
  { key: 'longitude', label: 'Longitude', description: 'Geographic longitude coordinate' },
];

const COMMON_MAPPINGS = {
  'PARTICIPANT_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'STD_ADDR': 'address',
  'ADDRESS': 'address',
  'FULL_ADDRESS': 'address',
  'STD_CITY': 'city',
  'CITY': 'city',
  'STD_ST': 'state',
  'STATE': 'state',
  'STD_ZIP5': 'zip',
  'ZIP': 'zip',
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EXEC_DIR_EMAIL': 'email',
  'EMAIL': 'email',
  'WEBSITE': 'website',
  'LAT': 'latitude',
  'LATITUDE': 'latitude',
  'LON': 'longitude',
  'LONGITUDE': 'longitude',
  'HA_PROGRAM_TYPE': 'supports_hcv',
  'WAITLIST_STATUS': 'waitlist_status',
};

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  csvHeaders,
  onMappingConfirm,
  defaultMappings = []
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMappedCount, setAutoMappedCount] = useState(0);

  useEffect(() => {
    if (csvHeaders.length > 0) {
      // Auto-map based on common field names
      const newMappings: FieldMapping[] = [];
      let autoMapped = 0;

      csvHeaders.forEach(csvField => {
        const normalizedField = csvField.toUpperCase().trim();
        const dbField = COMMON_MAPPINGS[normalizedField] || '';
        
        newMappings.push({
          csvField,
          dbField
        });

        if (dbField) autoMapped++;
      });

      // Apply default mappings if provided
      if (defaultMappings.length > 0) {
        defaultMappings.forEach(defaultMapping => {
          const index = newMappings.findIndex(m => m.csvField === defaultMapping.csvField);
          if (index >= 0) {
            newMappings[index].dbField = defaultMapping.dbField;
          }
        });
      }

      setMappings(newMappings);
      setAutoMappedCount(autoMapped);
    }
  }, [csvHeaders, defaultMappings]);

  const updateMapping = (csvField: string, dbField: string) => {
    setMappings(prev => prev.map(m => 
      m.csvField === csvField ? { ...m, dbField } : m
    ));
  };

  const getUsedDbFields = () => {
    return mappings.filter(m => m.dbField && m.dbField !== 'skip').map(m => m.dbField);
  };

  const getRequiredFieldStatus = () => {
    const usedFields = getUsedDbFields();
    const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.key);
    const missingRequired = requiredFields.filter(field => !usedFields.includes(field));
    return { missingRequired, hasRequired: missingRequired.length === 0 };
  };

  const downloadMappingTemplate = () => {
    const template = DATABASE_FIELDS.map(field => 
      `${field.key},${field.label},"${field.description}"`
    ).join('\n');
    
    const blob = new Blob([`Database Field,Label,Description\n${template}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pha_field_mapping_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    const validMappings = mappings.filter(m => m.dbField && m.dbField !== 'skip');
    onMappingConfirm(validMappings);
  };

  const { missingRequired, hasRequired } = getRequiredFieldStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Map CSV Fields to Database
          </DialogTitle>
          <DialogDescription>
            Map your CSV columns to the corresponding database fields. Required fields must be mapped to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {autoMappedCount} of {csvHeaders.length} fields auto-mapped
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadMappingTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Field Reference
            </Button>
          </div>

          {!hasRequired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing required fields: {missingRequired.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {mappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">CSV Column</Label>
                    <div className="mt-1 p-2 bg-muted rounded border">
                      <code className="text-sm">{mapping.csvField}</code>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Database Field</Label>
                    <Select 
                      value={mapping.dbField || 'skip'} 
                      onValueChange={(value) => updateMapping(mapping.csvField, value === 'skip' ? '' : value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select database field..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="skip">-- Skip this field --</SelectItem>
                        {DATABASE_FIELDS.map(field => (
                          <SelectItem key={field.key} value={field.key}>
                            <div className="flex items-center gap-2">
                              <span>{field.label}</span>
                              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mapping.dbField && mapping.dbField !== 'skip' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {DATABASE_FIELDS.find(f => f.key === mapping.dbField)?.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!hasRequired}
          >
            Apply Mapping & Continue Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
