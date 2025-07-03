
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DATABASE_FIELDS } from './constants';

interface FieldMappingRowProps {
  csvField: string;
  dbField: string;
  onMappingChange: (csvField: string, dbField: string) => void;
}

export const FieldMappingRow: React.FC<FieldMappingRowProps> = ({
  csvField,
  dbField,
  onMappingChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
      <div>
        <Label className="text-sm font-medium">CSV Column</Label>
        <div className="mt-1 p-2 bg-muted rounded border">
          <code className="text-sm">{csvField}</code>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Database Field</Label>
        <Select 
          value={dbField || 'skip'} 
          onValueChange={(value) => onMappingChange(csvField, value === 'skip' ? '' : value)}
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
        {dbField && dbField !== 'skip' && (
          <p className="text-xs text-muted-foreground mt-1">
            {DATABASE_FIELDS.find(f => f.key === dbField)?.description}
          </p>
        )}
      </div>
    </div>
  );
};
