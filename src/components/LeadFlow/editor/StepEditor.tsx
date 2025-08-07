import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StepType, FieldType } from '@/types/leadFlow';
import FieldEditor from './FieldEditor';
import SinglePageLandingEditor from './SinglePageLandingEditor';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

interface StepEditorProps {
  step: any;
  index: number;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: any;
}

export default function StepEditor({
  step,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  dragHandleProps
}: StepEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getStepTypeLabel = (type: StepType) => {
    switch (type) {
      case StepType.FORM:
        return 'Form Step';
      case StepType.QUIZ:
        return 'Quiz Step';
      case StepType.CONTENT:
        return 'Content Step';
      case StepType.THANK_YOU:
        return 'Thank You Step';
      case StepType.SINGLE_PAGE_LANDING:
        return 'Single Page Landing';
      case StepType.RATING:
        return 'Rating Step';
      case StepType.VIDEO:
        return 'Video Step';
      case StepType.FILE_UPLOAD:
        return 'File Upload Step';
      case StepType.IMAGE_GALLERY:
        return 'Image Gallery';
      case StepType.TESTIMONIAL:
        return 'Testimonial';
      case StepType.COUNTDOWN:
        return 'Countdown Timer';
      default:
        return 'Step';
    }
  };

  const addField = () => {
    const newField = {
      tempId: Date.now().toString(),
      field_order: (step.fields?.length || 0) + 1,
      field_type: FieldType.TEXT,
      field_name: `field_${Date.now()}`,
      label: 'New Field',
      placeholder: '',
      help_text: '',
      is_required: false,
      validation_rules: {},
      options: [],
      default_value: '',
      conditional_logic: {}
    };

    onUpdate({
      fields: [...(step.fields || []), newField]
    });
  };

  const updateField = (fieldIndex: number, updates: any) => {
    const updatedFields = [...(step.fields || [])];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates };
    onUpdate({ fields: updatedFields });
  };

  const deleteField = (fieldIndex: number) => {
    onUpdate({
      fields: (step.fields || []).filter((_: any, i: number) => i !== fieldIndex)
    });
  };

  const duplicateField = (fieldIndex: number) => {
    const fieldToDuplicate = step.fields[fieldIndex];
    const newField = {
      ...fieldToDuplicate,
      tempId: Date.now().toString(),
      id: undefined,
      field_name: `${fieldToDuplicate.field_name}_copy`,
      label: `${fieldToDuplicate.label} (Copy)`
    };

    const updatedFields = [...step.fields];
    updatedFields.splice(fieldIndex + 1, 0, newField);
    onUpdate({ fields: updatedFields });
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div {...dragHandleProps} className="cursor-move">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Step {index + 1}</Badge>
                <Badge>{getStepTypeLabel(step.step_type)}</Badge>
              </div>
              <h3 className="font-medium">
                {step.title || 'Untitled Step'}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
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
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`title-${index}`}>Title</Label>
                <Input
                  id={`title-${index}`}
                  value={step.title || ''}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Step title"
                />
              </div>
              
              <div>
                <Label htmlFor={`button-${index}`}>Button Text</Label>
                <Input
                  id={`button-${index}`}
                  value={step.button_text || ''}
                  onChange={(e) => onUpdate({ button_text: e.target.value })}
                  placeholder="Next"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`subtitle-${index}`}>Subtitle</Label>
              <Input
                id={`subtitle-${index}`}
                value={step.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>

            {/* Content for content/thank you steps */}
            {(step.step_type === StepType.CONTENT || step.step_type === StepType.THANK_YOU) && (
              <div>
                <Label htmlFor={`content-${index}`}>Content (HTML)</Label>
                <Textarea
                  id={`content-${index}`}
                  value={step.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Enter HTML content..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Redirect configuration for thank you steps */}
            {step.step_type === StepType.THANK_YOU && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Redirect Configuration (Optional)</h4>
                <div>
                  <Label htmlFor={`redirect-url-${index}`}>Redirect URL</Label>
                  <Input
                    id={`redirect-url-${index}`}
                    value={step.redirect_url || ''}
                    onChange={(e) => onUpdate({ redirect_url: e.target.value })}
                    placeholder="e.g., /section8 or https://example.com/guide"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to show default action buttons. Use internal paths (e.g., /section8) or full URLs.
                  </p>
                </div>
                <div>
                  <Label htmlFor={`redirect-delay-${index}`}>Redirect Delay (seconds)</Label>
                  <Input
                    id={`redirect-delay-${index}`}
                    type="number"
                    min="0"
                    max="30"
                    value={step.redirect_delay || 3}
                    onChange={(e) => onUpdate({ redirect_delay: parseInt(e.target.value) || 3 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long to wait before redirecting (default: 3 seconds)
                  </p>
                </div>
              </div>
            )}

            {/* Single Page Landing Configuration */}
            {step.step_type === StepType.SINGLE_PAGE_LANDING && (
              <div className="space-y-4">
                <SinglePageLandingEditor 
                  step={step} 
                  onUpdate={onUpdate} 
                />
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`required-${index}`}>Required Step</Label>
              <Switch
                id={`required-${index}`}
                checked={step.is_required}
                onCheckedChange={(checked) => onUpdate({ is_required: checked })}
              />
            </div>

            {/* Fields for form/quiz/landing steps */}
            {(step.step_type === StepType.FORM || step.step_type === StepType.QUIZ || step.step_type === StepType.SINGLE_PAGE_LANDING) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Fields</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </Button>
                </div>

                {step.fields && step.fields.length > 0 ? (
                  <div className="space-y-3">
                    {step.fields.map((field: any, fieldIndex: number) => (
                      <FieldEditor
                        key={field.id || field.tempId}
                        field={field}
                        index={fieldIndex}
                        isQuiz={step.step_type === StepType.QUIZ}
                        onUpdate={(updates) => updateField(fieldIndex, updates)}
                        onDelete={() => deleteField(fieldIndex)}
                        onDuplicate={() => duplicateField(fieldIndex)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                    No fields yet. Click "Add Field" to start.
                  </div>
                )}
              </div>
            )}

            {/* Conditional Logic - for all step types except single page landing */}
            {step.step_type !== StepType.SINGLE_PAGE_LANDING && (
              <div className="pt-4 border-t">
                <ConditionalLogicBuilder
                  logic={step.skip_logic?.conditions || []}
                  onUpdate={(conditions) => 
                    onUpdate({ skip_logic: { conditions } })
                  }
                  availableFields={
                    // Get all fields from all previous steps (this would need to be passed from parent)
                    step.fields?.map((f: any) => ({
                      name: f.field_name,
                      label: f.label,
                      type: f.field_type
                    })) || []
                  }
                  availableSteps={
                    // This would need to be passed from parent for full functionality
                    [{ order: index, title: step.title || `Step ${index + 1}` }]
                  }
                />
              </div>
            )}

            {/* Step Settings for specific types */}
            {step.step_type === StepType.VIDEO && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Video Settings</h4>
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={step.settings?.videoUrl || ''}
                    onChange={(e) => onUpdate({ 
                      settings: { ...step.settings, videoUrl: e.target.value } 
                    })}
                    placeholder="YouTube ID, Vimeo ID, or direct video URL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={step.settings?.provider || 'direct'}
                      onChange={(e) => onUpdate({ 
                        settings: { ...step.settings, provider: e.target.value } 
                      })}
                    >
                      <option value="direct">Direct Video</option>
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Autoplay</Label>
                    <Switch
                      checked={step.settings?.autoplay || false}
                      onCheckedChange={(checked) => onUpdate({ 
                        settings: { ...step.settings, autoplay: checked } 
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rating Step Configuration */}
            {step.step_type === StepType.RATING && step.fields?.[0] && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Rating Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rating Style</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={step.fields[0].options?.[0]?.value || 'stars'}
                      onChange={(e) => {
                        const field = step.fields[0];
                        updateField(0, {
                          options: [{ value: e.target.value }, ...(field.options?.slice(1) || [])]
                        });
                      }}
                    >
                      <option value="stars">Stars</option>
                      <option value="hearts">Hearts</option>
                      <option value="thumbs">Thumbs</option>
                      <option value="numeric">Numbers</option>
                    </select>
                  </div>
                  <div>
                    <Label>Max Rating</Label>
                    <Input
                      type="number"
                      min="3"
                      max="10"
                      value={step.fields[0].validation_rules?.max || 5}
                      onChange={(e) => {
                        updateField(0, {
                          validation_rules: { 
                            ...step.fields[0].validation_rules, 
                            max: parseInt(e.target.value) || 5 
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}