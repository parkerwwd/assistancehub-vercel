
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadMappingTemplate, getRequiredFieldStatus } from './fieldMapping/utils';
import { COMMON_MAPPINGS } from './fieldMapping/constants';

export interface FieldMapping {
  csvField: string;
  dbField: string;
  checked: boolean;
}

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvHeaders: string[];
  onMappingConfirm: (mappings: FieldMapping[]) => void;
  defaultMappings?: FieldMapping[];
}

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  csvHeaders,
  onMappingConfirm,
  defaultMappings = []
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMappedCount, setAutoMappedCount] = useState(0);

  // Fields to exclude from mapping
  const excludedFields = ['state', 'city', 'zip', 'std_st', 'std_city', 'std_zip5'];

  // Memoize the default mappings to prevent unnecessary re-renders
  const memoizedDefaultMappings = useMemo(() => defaultMappings, [JSON.stringify(defaultMappings)]);

  useEffect(() => {
    if (csvHeaders.length > 0) {
      // Auto-map based on common field names
      const newMappings: FieldMapping[] = [];
      let autoMapped = 0;

      csvHeaders.forEach(csvField => {
        const normalizedField = csvField.toUpperCase().trim();
        const dbField = COMMON_MAPPINGS[normalizedField] || '';
        
        // Check if this field should be excluded
        const shouldExclude = excludedFields.some(excluded => 
          normalizedField.toLowerCase().includes(excluded.toLowerCase())
        );

        // Only include if not excluded and has a valid mapping
        if (!shouldExclude && dbField) {
          newMappings.push({
            csvField,
            dbField,
            checked: true // Auto-check mapped fields
          });
          autoMapped++;
        }
      });

      // Apply default mappings if provided
      if (memoizedDefaultMappings.length > 0) {
        memoizedDefaultMappings.forEach(defaultMapping => {
          const index = newMappings.findIndex(m => m.csvField === defaultMapping.csvField);
          if (index >= 0) {
            newMappings[index].dbField = defaultMapping.dbField;
            newMappings[index].checked = defaultMapping.checked;
          }
        });
      }

      setMappings(newMappings);
      setAutoMappedCount(autoMapped);
    }
  }, [csvHeaders, memoizedDefaultMappings]);

  const updateMapping = (csvField: string, checked: boolean) => {
    setMappings(prev => prev.map(m => 
      m.csvField === csvField ? { ...m, checked } : m
    ));
  };

  const getCheckedMappings = () => {
    return mappings.filter(m => m.checked && m.dbField);
  };

  const handleConfirm = () => {
    const checkedMappings = getCheckedMappings();
    onMappingConfirm(checkedMappings);
  };

  const checkedMappings = getCheckedMappings();
  const { missingRequired, hasRequired } = getRequiredFieldStatus(checkedMappings.map(m => m.dbField));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Select Fields to Import
          </DialogTitle>
          <DialogDescription>
            Select which fields you want to import from your CSV. Required fields must be selected to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {autoMappedCount} fields available for import ({checkedMappings.length} selected)
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
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={`field-${index}`}
                    checked={mapping.checked}
                    onCheckedChange={(checked) => updateMapping(mapping.csvField, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`field-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {mapping.csvField}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maps to: <span className="font-medium">{mapping.dbField}</span>
                      {mapping.dbField === 'name' && <span className="text-red-500 ml-1">(Required)</span>}
                    </p>
                  </div>
                </div>
              ))}
              {mappings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No mappable fields found in your CSV.</p>
                  <p className="text-sm mt-2">Please ensure your CSV contains the expected field names.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!hasRequired || checkedMappings.length === 0}
          >
            Import Selected Fields ({checkedMappings.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
