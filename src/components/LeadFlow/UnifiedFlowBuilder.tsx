import React, { useState, useCallback } from 'react';
import { Plus, Eye, Save, Upload, Trash, Copy, ArrowLeft, ArrowRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  FlowPayload, 
  FlowPayloadStep, 
  StyleConfig,
  validateFlowPayload 
} from '@/types/flowSchema';
import { 
  StepRegistry, 
  createDefaultStep, 
  getStepsByCategory, 
  STEP_CATEGORIES,
  StepMeta
} from '@/components/LeadFlow/stepRegistry';
import { FlowService, ServiceResult } from '@/services/flowService';
import StepEditor from '@/components/LeadFlow/editor/StepEditor';
import StyleEditor from '@/components/LeadFlow/editor/StyleEditor';
import FlowPreview from '@/components/LeadFlow/FlowPreview';

interface UnifiedFlowBuilderProps {
  flowId?: string;
  onSaved?: (flowId: string) => void;
  onPublished?: (flowId: string) => void;
}

interface ValidationError {
  type: 'flow' | 'step';
  stepIndex?: number;
  message: string;
}

export default function UnifiedFlowBuilder({ 
  flowId, 
  onSaved, 
  onPublished 
}: UnifiedFlowBuilderProps) {
  // Enhanced state management with proper types
  const [flow, setFlow] = useState<FlowPayload>(() => ({
    name: 'New Flow',
    slug: `flow-${Date.now()}`,
    description: '',
    status: 'draft',
    settings: {
      allowBack: true,
      showProgress: true,
      saveProgress: false,
      requireAuth: false,
      captureUtm: true,
      trackAnalytics: true,
    },
    google_ads_config: {
      conversionId: '',
      conversionLabel: '',
      remarketingTag: false,
      enhancedConversions: false,
    },
    style_config: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      buttonStyle: 'rounded',
      layout: 'centered',
      fontFamily: 'Inter',
      borderRadius: 8,
      shadowLevel: 'md',
    },
    steps: [createDefaultStep('form', 1)],
    logic: [],
    metadata: {
      category: 'lead-generation',
      tags: [],
      estimatedTime: 5,
      difficulty: 'easy',
    },
  }));

  const [activeTab, setActiveTab] = useState<'builder' | 'style' | 'settings' | 'preview'>('builder');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showStepSelector, setShowStepSelector] = useState(false);

  // Validation with proper error handling
  const validateFlow = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Flow-level validation
    const flowValidation = validateFlowPayload(flow);
    if (!flowValidation.success) {
      errors.push(...(flowValidation.errors || []).map(err => ({
        type: 'flow' as const,
        message: err
      })));
    }

    // Step-level validation using registry
    flow.steps.forEach((step, index) => {
      const stepMeta = StepRegistry[step.step_type];
      if (stepMeta) {
        const stepValidation = stepMeta.validate(step);
        if (!stepValidation.isValid) {
          errors.push(...stepValidation.errors.map(err => ({
            type: 'step' as const,
            stepIndex: index,
            message: err
          })));
        }
      }
    });

    return errors;
  }, [flow]);

  // Update validation on flow changes
  React.useEffect(() => {
    const errors = validateFlow();
    setValidationErrors(errors);
  }, [flow, validateFlow]);

  // Step management with drag & drop
  const handleStepReorder = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const newSteps = Array.from(flow.steps);
    const [movedStep] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, movedStep);

    // Update step orders
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      step_order: index + 1
    }));

    setFlow(prev => ({ ...prev, steps: updatedSteps }));
    setSelectedStepIndex(result.destination.index);
  }, [flow.steps]);

  const addStep = useCallback((stepType: FlowPayloadStep['step_type']) => {
    const newStep = createDefaultStep(stepType, flow.steps.length + 1);
    setFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    setSelectedStepIndex(flow.steps.length);
    setShowStepSelector(false);
  }, [flow.steps.length]);

  const updateStep = useCallback((index: number, updates: Partial<FlowPayloadStep>) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  }, []);

  const deleteStep = useCallback((index: number) => {
    if (flow.steps.length <= 1) {
      toast({ title: 'Cannot delete', description: 'Flow must have at least one step' });
      return;
    }
    
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
    
    if (selectedStepIndex >= flow.steps.length - 1) {
      setSelectedStepIndex(Math.max(0, selectedStepIndex - 1));
    }
  }, [flow.steps.length, selectedStepIndex]);

  const duplicateStep = useCallback((index: number) => {
    const stepToDuplicate = flow.steps[index];
    const newStep = {
      ...stepToDuplicate,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      step_order: flow.steps.length + 1
    };
    
    setFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, [flow.steps]);

  // Save & Publish handlers
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await FlowService.saveDraft(flowId || null, flow);
      if (result.success) {
        toast({ title: 'Saved', description: 'Flow saved as draft' });
        onSaved?.(result.data!.flowId);
      } else {
        toast({ 
          title: 'Save failed', 
          description: result.errors?.join(', ') || 'Unknown error',
          variant: 'destructive' 
        });
      }
    } finally {
      setSaving(false);
    }
  }, [flowId, flow, onSaved]);

  const handlePublish = useCallback(async () => {
    const errors = validateFlow();
    if (errors.length > 0) {
      toast({ 
        title: 'Cannot publish', 
        description: 'Please fix validation errors first',
        variant: 'destructive'
      });
      return;
    }

    setPublishing(true);
    try {
      // Save first, then publish
      const saveResult = await FlowService.saveDraft(flowId || null, flow);
      if (!saveResult.success) {
        toast({ 
          title: 'Publish failed', 
          description: saveResult.errors?.join(', ') || 'Failed to save',
          variant: 'destructive' 
        });
        return;
      }

      const publishResult = await FlowService.publish(saveResult.data!.flowId);
      if (publishResult.success) {
        toast({ title: 'Published!', description: 'Flow is now live' });
        onPublished?.(saveResult.data!.flowId);
        
        // Open preview in new tab
        window.open(`/flow/${flow.slug}`, '_blank');
      } else {
        toast({ 
          title: 'Publish failed', 
          description: publishResult.errors?.join(', ') || 'Unknown error',
          variant: 'destructive' 
        });
      }
    } finally {
      setPublishing(false);
    }
  }, [flowId, flow, validateFlow, onPublished]);

  const isValid = validationErrors.length === 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <input
            type="text"
            value={flow.name}
            onChange={(e) => setFlow(prev => ({ ...prev, name: e.target.value }))}
            className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Flow Name"
          />
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
              {flow.status}
            </Badge>
            <span className="text-sm text-gray-500">
              {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}
            </span>
            {!isValid && (
              <Badge variant="destructive">
                {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={handlePublish}
            disabled={publishing || !isValid}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6 py-2">
        <div className="flex gap-4">
          {([
            { key: 'builder', label: 'Flow Builder', icon: '🔨' },
            { key: 'style', label: 'Style & Design', icon: '🎨' },
            { key: 'settings', label: 'Settings', icon: '⚙️' },
            { key: 'preview', label: 'Preview', icon: '👁️' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'builder' && (
          <>
            {/* Steps Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Flow Steps</h3>
                  <Dialog open={showStepSelector} onOpenChange={setShowStepSelector}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-8">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Add New Step</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(STEP_CATEGORIES).map(([category, label]) => (
                          <div key={category}>
                            <h4 className="font-medium mb-3">{label}</h4>
                            <div className="space-y-2">
                              {getStepsByCategory(category as keyof typeof STEP_CATEGORIES).map(step => (
                                <button
                                  key={step.type}
                                  onClick={() => addStep(step.type)}
                                  className="w-full p-3 text-left rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{step.icon}</span>
                                    <div>
                                      <div className="font-medium">{step.displayName}</div>
                                      <div className="text-sm text-gray-500">{step.description}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <div className="text-sm">
                        <div className="font-medium mb-1">Validation Errors:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-xs">
                              {error.type === 'step' ? `Step ${(error.stepIndex || 0) + 1}: ` : ''}
                              {error.message}
                            </li>
                          ))}
                          {validationErrors.length > 3 && (
                            <li className="text-xs">+{validationErrors.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Draggable Steps List */}
              <div className="flex-1 overflow-y-auto p-4">
                <DragDropContext onDragEnd={handleStepReorder}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {flow.steps.map((step, index) => {
                          const stepMeta = StepRegistry[step.step_type];
                          const stepErrors = validationErrors.filter(e => e.stepIndex === index);
                          
                          return (
                            <Draggable key={step.id} draggableId={step.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedStepIndex === index
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                  onClick={() => setSelectedStepIndex(index)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600">
                                      <span className="text-sm">⋮⋮</span>
                                    </div>
                                    <span className="text-lg">{stepMeta?.icon || '📄'}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {step.title || stepMeta?.displayName || 'Untitled Step'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {stepMeta?.displayName || step.step_type}
                                      </div>
                                      {stepErrors.length > 0 && (
                                        <div className="text-xs text-red-600 mt-1">
                                          {stepErrors.length} error{stepErrors.length !== 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            {/* Step Editor */}
            <div className="flex-1 overflow-y-auto">
              {flow.steps[selectedStepIndex] && (
                <StepEditor
                  step={flow.steps[selectedStepIndex]}
                  index={selectedStepIndex}
                  onUpdate={(updates) => updateStep(selectedStepIndex, updates)}
                  onDelete={() => deleteStep(selectedStepIndex)}
                  onDuplicate={() => duplicateStep(selectedStepIndex)}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'style' && (
          <div className="flex-1 overflow-y-auto">
            <StyleEditor
              styleConfig={flow.style_config}
              onChange={(updates) => setFlow(prev => ({
                ...prev,
                style_config: { ...prev.style_config, ...updates }
              }))}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <FlowPreview flow={flow} />
          </div>
        )}
      </div>
    </div>
  );
}
