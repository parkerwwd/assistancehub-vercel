
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldMappingRow } from './fieldMapping/FieldMappingRow';
import { downloadMappingTemplate, getRequiredFieldStatus } from './fieldMapping/utils';
import { COMMON_MAPPINGS } from './fieldMapping/constants';

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

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  csvHeaders,
  onMappingConfirm,
  defaultMappings = []
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMappedCount, setAutoMappedCount] = useState(0);

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
        
        newMappings.push({
          csvField,
          dbField
        });

        if (dbField) autoMapped++;
      });

      // Apply default mappings if provided
      if (memoizedDefaultMappings.length > 0) {
        memoizedDefaultMappings.forEach(defaultMapping => {
          const index = newMappings.findIndex(m => m.csvField === defaultMapping.csvField);
          if (index >= 0) {
            newMappings[index].dbField = defaultMapping.dbField;
          }
        });
      }

      setMappings(newMappings);
      setAutoMappedCount(autoMapped);
    }
  }, [csvHeaders, memoizedDefaultMappings]);

  const updateMapping = (csvField: string, dbField: string) => {
    setMappings(prev => prev.map(m => 
      m.csvField === csvField ? { ...m, dbField } : m
    ));
  };

  const getUsedDbFields = () => {
    return mappings.filter(m => m.dbField && m.dbField !== 'skip').map(m => m.dbField);
  };

  const handleConfirm = () => {
    const validMappings = mappings.filter(m => m.dbField && m.dbField !== 'skip');
    onMappingConfirm(validMappings);
  };

  const { missingRequired, hasRequired } = getRequiredFieldStatus(getUsedDbFields());

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
                <FieldMappingRow
                  key={index}
                  csvField={mapping.csvField}
                  dbField={mapping.dbField}
                  onMappingChange={updateMapping}
                />
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
