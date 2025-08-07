import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldType } from '@/types/leadFlow';

interface ValidationRuleBuilderProps {
  fieldType: FieldType;
  rules: any;
  onUpdate: (rules: any) => void;
  isRequired: boolean;
  onRequiredChange: (required: boolean) => void;
}

export default function ValidationRuleBuilder({
  fieldType,
  rules = {},
  onUpdate,
  isRequired,
  onRequiredChange
}: ValidationRuleBuilderProps) {
  const updateRule = (key: string, value: any) => {
    onUpdate({ ...rules, [key]: value });
  };

  const deleteRule = (key: string) => {
    const newRules = { ...rules };
    delete newRules[key];
    onUpdate(newRules);
  };

  const renderValidationOptions = () => {
    switch (fieldType) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Length</Label>
                <Input
                  type="number"
                  min="0"
                  value={rules.minLength || ''}
                  onChange={(e) => updateRule('minLength', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No minimum"
                />
              </div>
              <div>
                <Label>Max Length</Label>
                <Input
                  type="number"
                  min="0"
                  value={rules.maxLength || ''}
                  onChange={(e) => updateRule('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No maximum"
                />
              </div>
            </div>
            
            <div>
              <Label>Pattern (RegEx)</Label>
              <Input
                value={rules.pattern || ''}
                onChange={(e) => updateRule('pattern', e.target.value)}
                placeholder="e.g., ^[A-Za-z]+$"
              />
              {rules.pattern && (
                <p className="text-xs text-gray-500 mt-1">
                  Only allows characters matching this pattern
                </p>
              )}
            </div>
            
            <div>
              <Label>Custom Error Message</Label>
              <Input
                value={rules.customMessage || ''}
                onChange={(e) => updateRule('customMessage', e.target.value)}
                placeholder="Please enter valid text"
              />
            </div>
          </>
        );

      case FieldType.EMAIL:
        return (
          <>
            <div className="flex items-center justify-between">
              <Label>Validate Email Format</Label>
              <Switch
                checked={rules.validateFormat !== false}
                onCheckedChange={(checked) => updateRule('validateFormat', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Check MX Records</Label>
              <Switch
                checked={rules.checkMX || false}
                onCheckedChange={(checked) => updateRule('checkMX', checked)}
              />
            </div>
            
            <div>
              <Label>Blocked Domains</Label>
              <Textarea
                value={rules.blockedDomains?.join('\n') || ''}
                onChange={(e) => updateRule('blockedDomains', e.target.value.split('\n').filter(d => d.trim()))}
                placeholder="example.com&#10;tempmail.com"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                One domain per line
              </p>
            </div>
          </>
        );

      case FieldType.PHONE:
        return (
          <>
            <div>
              <Label>Country Code</Label>
              <Select
                value={rules.countryCode || 'US'}
                onValueChange={(value) => updateRule('countryCode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States (+1)</SelectItem>
                  <SelectItem value="CA">Canada (+1)</SelectItem>
                  <SelectItem value="UK">United Kingdom (+44)</SelectItem>
                  <SelectItem value="AU">Australia (+61)</SelectItem>
                  <SelectItem value="ANY">Any Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Allow Mobile Only</Label>
              <Switch
                checked={rules.mobileOnly || false}
                onCheckedChange={(checked) => updateRule('mobileOnly', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Validate Format</Label>
              <Switch
                checked={rules.validateFormat !== false}
                onCheckedChange={(checked) => updateRule('validateFormat', checked)}
              />
            </div>
          </>
        );

      case FieldType.NUMBER:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Value</Label>
                <Input
                  type="number"
                  value={rules.min ?? ''}
                  onChange={(e) => updateRule('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No minimum"
                />
              </div>
              <div>
                <Label>Maximum Value</Label>
                <Input
                  type="number"
                  value={rules.max ?? ''}
                  onChange={(e) => updateRule('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No maximum"
                />
              </div>
            </div>
            
            <div>
              <Label>Step</Label>
              <Input
                type="number"
                value={rules.step || ''}
                onChange={(e) => updateRule('step', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Any value (e.g., 0.01 for decimals)"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Integer Only</Label>
              <Switch
                checked={rules.integerOnly || false}
                onCheckedChange={(checked) => updateRule('integerOnly', checked)}
              />
            </div>
          </>
        );

      case FieldType.ZIP:
        return (
          <>
            <div>
              <Label>Country Format</Label>
              <Select
                value={rules.country || 'US'}
                onValueChange={(value) => updateRule('country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">US (5 or 9 digits)</SelectItem>
                  <SelectItem value="CA">Canada (A1A 1A1)</SelectItem>
                  <SelectItem value="UK">UK (AA1 1AA)</SelectItem>
                  <SelectItem value="ANY">Any Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Auto-format Input</Label>
              <Switch
                checked={rules.autoFormat !== false}
                onCheckedChange={(checked) => updateRule('autoFormat', checked)}
              />
            </div>
          </>
        );

      case FieldType.DATE:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Date</Label>
                <Input
                  type="date"
                  value={rules.minDate || ''}
                  onChange={(e) => updateRule('minDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Max Date</Label>
                <Input
                  type="date"
                  value={rules.maxDate || ''}
                  onChange={(e) => updateRule('maxDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Disable Past Dates</Label>
              <Switch
                checked={rules.disablePast || false}
                onCheckedChange={(checked) => updateRule('disablePast', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Disable Future Dates</Label>
              <Switch
                checked={rules.disableFuture || false}
                onCheckedChange={(checked) => updateRule('disableFuture', checked)}
              />
            </div>
          </>
        );

      case FieldType.SELECT:
      case FieldType.RADIO:
      case FieldType.CHECKBOX:
        return (
          <>
            {fieldType === FieldType.CHECKBOX && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Selections</Label>
                    <Input
                      type="number"
                      min="0"
                      value={rules.minSelections || ''}
                      onChange={(e) => updateRule('minSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="No minimum"
                    />
                  </div>
                  <div>
                    <Label>Max Selections</Label>
                    <Input
                      type="number"
                      min="0"
                      value={rules.maxSelections || ''}
                      onChange={(e) => updateRule('maxSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between">
              <Label>Allow "Other" Option</Label>
              <Switch
                checked={rules.allowOther || false}
                onCheckedChange={(checked) => updateRule('allowOther', checked)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Validation Rules</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Field */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="space-y-0.5">
            <Label>Required Field</Label>
            <p className="text-xs text-gray-500">User must fill this field</p>
          </div>
          <Switch
            checked={isRequired}
            onCheckedChange={onRequiredChange}
          />
        </div>

        {/* Field Type Specific Validation */}
        {renderValidationOptions()}

        {/* Validation Preview */}
        {Object.keys(rules).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Active Validation Rules:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {isRequired && <li>Field is required</li>}
                  {rules.minLength && <li>Minimum {rules.minLength} characters</li>}
                  {rules.maxLength && <li>Maximum {rules.maxLength} characters</li>}
                  {rules.min !== undefined && <li>Minimum value: {rules.min}</li>}
                  {rules.max !== undefined && <li>Maximum value: {rules.max}</li>}
                  {rules.pattern && <li>Must match pattern: {rules.pattern}</li>}
                  {rules.validateFormat && <li>Format validation enabled</li>}
                  {rules.minSelections && <li>Minimum {rules.minSelections} selections</li>}
                  {rules.maxSelections && <li>Maximum {rules.maxSelections} selections</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
