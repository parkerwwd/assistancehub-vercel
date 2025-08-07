import React, { useState } from 'react';
import { Trash2, Copy, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldType } from '@/types/leadFlow';
import ValidationRuleBuilder from './ValidationRuleBuilder';

interface FieldEditorProps {
  field: any;
  index: number;
  isQuiz?: boolean;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function FieldEditor({
  field,
  index,
  isQuiz,
  onUpdate,
  onDelete,
  onDuplicate
}: FieldEditorProps) {
  const [showOptions, setShowOptions] = useState(
    field.options && field.options.length > 0
  );

  const fieldTypes = isQuiz 
    ? [FieldType.RADIO, FieldType.CHECKBOX]
    : Object.values(FieldType);

  const needsOptions = [
    FieldType.SELECT,
    FieldType.RADIO,
    FieldType.CHECKBOX
  ].includes(field.field_type);

  const addOption = () => {
    const newOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option_${Date.now()}`,
      icon: isQuiz ? 'home' : undefined
    };
    
    onUpdate({
      options: [...(field.options || []), newOption]
    });
    setShowOptions(true);
  };

  const updateOption = (optionIndex: number, updates: any) => {
    const updatedOptions = [...(field.options || [])];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...updates };
    onUpdate({ options: updatedOptions });
  };

  const deleteOption = (optionIndex: number) => {
    onUpdate({
      options: (field.options || []).filter((_: any, i: number) => i !== optionIndex)
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select
                  value={field.field_type}
                  onValueChange={(value: FieldType) => {
                    onUpdate({ field_type: value });
                    if (needsOptions && (!field.options || field.options.length === 0)) {
                      addOption();
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Field Name (Internal)</Label>
                <Input
                  value={field.field_name || ''}
                  onChange={(e) => onUpdate({ field_name: e.target.value })}
                  placeholder="e.g., email, firstName"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Label</Label>
              <Input
                value={field.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Field label"
              />
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Placeholder text"
                disabled={needsOptions}
              />
            </div>
          </div>

          <div>
            <Label>Help Text</Label>
            <Input
              value={field.help_text || ''}
              onChange={(e) => onUpdate({ help_text: e.target.value })}
              placeholder="Optional help text"
            />
          </div>

          {/* Options for select/radio/checkbox */}
          {needsOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>

              {field.options && field.options.length > 0 && (
                <div className="space-y-2">
                  {field.options.map((option: any, optionIndex: number) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <Input
                        value={option.label || ''}
                        onChange={(e) => updateOption(optionIndex, { label: e.target.value })}
                        placeholder="Option label"
                        className="flex-1"
                      />
                      <Input
                        value={option.value || ''}
                        onChange={(e) => updateOption(optionIndex, { value: e.target.value })}
                        placeholder="Value"
                        className="w-32"
                      />
                      {isQuiz && (
                        <Input
                          value={option.icon || ''}
                          onChange={(e) => updateOption(optionIndex, { icon: e.target.value })}
                          placeholder="Icon"
                          className="w-24"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOption(optionIndex)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Field Settings with Tabs */}
          <div className="mt-4">
            <Tabs defaultValue="validation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="validation" className="mt-4">
                <ValidationRuleBuilder
                  fieldType={field.field_type}
                  rules={field.validation_rules || {}}
                  onUpdate={(rules) => onUpdate({ validation_rules: rules })}
                  isRequired={field.is_required || false}
                  onRequiredChange={(required) => onUpdate({ is_required: required })}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-4 space-y-4">
                <div>
                  <Label>Default Value</Label>
                  <Input
                    value={field.default_value || ''}
                    onChange={(e) => onUpdate({ default_value: e.target.value })}
                    placeholder="Leave empty for no default"
                  />
                </div>
                
                {field.field_type === FieldType.HIDDEN && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Hidden fields are not visible to users. Use them to capture URL parameters or internal values.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}