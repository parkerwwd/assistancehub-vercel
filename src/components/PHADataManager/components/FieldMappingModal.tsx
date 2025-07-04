
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { parseCSV, extractCSVHeaders } from "../utils/csvParser";

interface FieldMapping {
  csvHeaderName: string | null; // The actual CSV header name
  originField: string; // The expected field name we're looking for
  mappedField: string; // What we're mapping it to
  isSelected: boolean;
  group: string;
}

interface FieldMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const FIELD_GROUPS = {
  'PHA Information': [
    { origin: 'FORMAL_PARTICIPANT_NAME', mapped: 'Agency Name (Title)' },
    { origin: 'FULL_ADDRESS', mapped: 'Address' },
    { origin: 'HA_PHN_NUM', mapped: 'Phone Number' },
    { origin: 'HA_EMAIL_ADDR_TEXT', mapped: 'Email Address' },
    { origin: 'EXEC_DIR_EMAIL', mapped: 'Executive Director Email' },
    { origin: 'PARTICIPANT_CODE', mapped: 'PHA Code' },
    { origin: 'HA_PROGRAM_TYPE', mapped: 'PHA Classification' },
  ]
};

export const FieldMappingModal: React.FC<FieldMappingModalProps> = ({ isOpen, onClose, file }) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);

  useEffect(() => {
    if (file && isOpen) {
      analyzeFile();
    }
  }, [file, isOpen]);

  const analyzeFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const text = await file.text();
      const headers = extractCSVHeaders(text);
      const data = parseCSV(text);
      
      setCsvHeaders(headers);
      setCsvData(data);
      
      console.log('CSV Headers:', headers);
      console.log('First row of data:', data[0]);
      
      // Create field mappings - only for predefined fields
      const mappings: FieldMapping[] = [];
      
      Object.entries(FIELD_GROUPS).forEach(([groupName, fields]) => {
        fields.forEach(field => {
          const foundHeader = headers.find(h => 
            h.toUpperCase() === field.origin.toUpperCase() ||
            h.toUpperCase().includes(field.origin.toUpperCase()) ||
            field.origin.toUpperCase().includes(h.toUpperCase())
          );
          
          console.log(`Mapping ${field.origin} to header: ${foundHeader || 'NOT FOUND'}`);
          
          mappings.push({
            csvHeaderName: foundHeader || null,
            originField: field.origin,
            mappedField: field.mapped,
            isSelected: !!foundHeader,
            group: groupName
          });
        });
      });
      
      setFieldMappings(mappings);
    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFieldMapping = (index: number, newMappedField: string) => {
    setFieldMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, mappedField: newMappedField } : mapping
    ));
  };

  const getSelectedCount = () => fieldMappings.filter(m => m.isSelected).length;
  const getTotalCount = () => fieldMappings.length;

  const handleProcessFile = () => {
    const selectedMappings = fieldMappings.filter(m => m.isSelected);
    console.log('Processing file with mappings:', selectedMappings);
    // TODO: Implement actual file processing logic
    onClose();
  };

  const groupedMappings = fieldMappings.reduce((acc, mapping) => {
    if (!acc[mapping.group]) {
      acc[mapping.group] = [];
    }
    acc[mapping.group].push(mapping);
    return acc;
  }, {} as Record<string, FieldMapping[]>);

  const availableFields = [
    'Agency Name (Title)',
    'Address',
    'Phone Number',
    'Email Address',
    'Executive Director Email',
    'PHA Code',
    'PHA Classification'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Field Mapping - {file?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* File Info */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">File Analysis Complete</span>
              </div>
              <div className="text-sm text-gray-600">
                {getSelectedCount()} of {getTotalCount()} fields mapped
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Records:</span> {csvData.length.toLocaleString()} | 
              <span className="font-medium ml-2">Size:</span> {(file?.size || 0 / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          {/* Field Mapping Table */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-6">
              {Object.entries(groupedMappings).map(([groupName, mappings]) => (
                <Card key={groupName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {groupName}
                      <span className="text-sm font-normal text-gray-500">
                        ({mappings.filter(m => m.isSelected).length}/{mappings.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Origin Field</TableHead>
                          <TableHead>Mapped Field</TableHead>
                          <TableHead>Sample Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.map((mapping, index) => {
                          const globalIndex = fieldMappings.findIndex(m => m === mapping);
                          // Use the actual CSV header name to get the sample data
                          const sampleValue = mapping.csvHeaderName && csvData[0] 
                            ? csvData[0][mapping.csvHeaderName] || 'N/A'
                            : 'N/A';
                          
                          console.log(`Sample for ${mapping.originField} (CSV header: ${mapping.csvHeaderName}):`, sampleValue);
                          
                          return (
                            <TableRow key={globalIndex}>
                              <TableCell className="font-mono text-sm">
                                {mapping.csvHeaderName || mapping.originField}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={mapping.mappedField}
                                  onValueChange={(value) => updateFieldMapping(globalIndex, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFields.map(field => (
                                      <SelectItem key={field} value={field}>
                                        {field}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                {sampleValue}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {getSelectedCount()} fields mapped for import
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcessFile}
                disabled={getSelectedCount() === 0}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Process File ({getSelectedCount()} fields)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
