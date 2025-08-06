import React from 'react';
import { motion } from 'framer-motion';
import { FlowStepWithFields, FieldValues, FieldType } from '@/types/leadFlow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, Mail, Phone, User, MapPin, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormStepProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: FieldValues;
  existingValues: FieldValues;
}

export default function FormStep({ step, onChange, values, existingValues }: FormStepProps) {
  const getFieldIcon = (fieldType: string, fieldName: string) => {
    if (fieldType === 'email') return <Mail className="w-4 h-4" />;
    if (fieldType === 'phone') return <Phone className="w-4 h-4" />;
    if (fieldType === 'zip') return <MapPin className="w-4 h-4" />;
    if (fieldType === 'date') return <Calendar className="w-4 h-4" />;
    if (fieldName.toLowerCase().includes('name')) return <User className="w-4 h-4" />;
    return null;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (fieldName: string, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    onChange(fieldName, cleaned);
  };

  const renderField = (field: any, index: number) => {
    const value = values[field.field_name] || existingValues[field.field_name] || '';
    const icon = getFieldIcon(field.field_type, field.field_name);

    return (
      <motion.div
        key={field.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="space-y-2"
      >
        {/* Only show label for non-phone fields */}
        {field.field_type !== FieldType.PHONE && (
          <div className="flex items-center justify-between">
            <Label htmlFor={field.field_name} className="flex items-center gap-2">
              {icon}
              {field.label}
              {field.is_required && <span className="text-red-500">*</span>}
            </Label>
            {field.help_text && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{field.help_text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* For phone fields, show help text without label */}
        {field.field_type === FieldType.PHONE && field.help_text && (
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{field.help_text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Text input */}
        {[FieldType.TEXT, FieldType.EMAIL, FieldType.NUMBER].includes(field.field_type) && (
          <Input
            id={field.field_name}
            type={field.field_type === FieldType.EMAIL ? 'email' : field.field_type === FieldType.NUMBER ? 'number' : 'text'}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.field_name, e.target.value)}
            required={field.is_required}
            className="transition-all duration-200 focus:scale-[1.02]"
          />
        )}

        {/* Phone input with formatting */}
        {field.field_type === FieldType.PHONE && (
          <Input
            id={field.field_name}
            type="tel"
            placeholder={field.placeholder || "(555) 555-5555"}
            value={formatPhoneNumber(value)}
            onChange={(e) => handlePhoneChange(field.field_name, e.target.value)}
            required={field.is_required}
            className="transition-all duration-200 focus:scale-[1.02]"
          />
        )}

        {/* ZIP code input */}
        {field.field_type === FieldType.ZIP && (
          <Input
            id={field.field_name}
            type="text"
            inputMode="numeric"
            placeholder={field.placeholder || "12345"}
            value={value}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 5);
              onChange(field.field_name, cleaned);
            }}
            required={field.is_required}
            maxLength={5}
            className="transition-all duration-200 focus:scale-[1.02] max-w-[150px]"
          />
        )}

        {/* Date input */}
        {field.field_type === FieldType.DATE && (
          <Input
            id={field.field_name}
            type="date"
            value={value}
            onChange={(e) => onChange(field.field_name, e.target.value)}
            required={field.is_required}
            className="transition-all duration-200 focus:scale-[1.02]"
          />
        )}

        {/* Textarea */}
        {field.field_type === FieldType.TEXTAREA && (
          <Textarea
            id={field.field_name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.field_name, e.target.value)}
            required={field.is_required}
            rows={4}
            className="transition-all duration-200 focus:scale-[1.01]"
          />
        )}

        {/* Select dropdown */}
        {field.field_type === FieldType.SELECT && (
          <Select
            value={value}
            onValueChange={(val) => onChange(field.field_name, val)}
            required={field.is_required}
          >
            <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Radio group */}
        {field.field_type === FieldType.RADIO && (
          <RadioGroup
            value={value}
            onValueChange={(val) => onChange(field.field_name, val)}
            required={field.is_required}
            className="space-y-2"
          >
            {field.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.field_name}-${option.value}`} />
                <Label 
                  htmlFor={`${field.field_name}-${option.value}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Checkbox group */}
        {field.field_type === FieldType.CHECKBOX && (
          <div className="space-y-2">
            {field.options?.map((option: any) => {
              const isChecked = Array.isArray(value) ? value.includes(option.value) : false;
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.field_name}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = checked 
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      onChange(field.field_name, newValues);
                    }}
                  />
                  <Label 
                    htmlFor={`${field.field_name}-${option.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden field */}
        {field.field_type === FieldType.HIDDEN && (
          <input
            type="hidden"
            name={field.field_name}
            value={field.default_value || ''}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {step.content && (
        <div 
          className="prose prose-gray max-w-none text-center mx-auto"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}

      <div className="space-y-4 max-w-md mx-auto">
        {step.fields?.map((field, index) => renderField(field, index))}
      </div>

      {/* Progressive disclosure hint */}
      {step.fields?.length === 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 text-center"
        >
          💡 We only ask for what we need, when we need it
        </motion.p>
      )}
    </div>
  );
}