import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Save, Eye, ArrowLeft, Settings, Copy, Link, Monitor, PanelRightClose, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Flow, FlowStep, FlowField, StepType, FieldType, FlowStatus } from '@/types/leadFlow';
import { FlowService } from '@/services/flowService';
import { FlowPayload } from '@/types/flowSchema';
import Header from '@/components/Header';
import StepEditor from '@/components/LeadFlow/editor/StepEditor';
import FlowSettings from '@/components/LeadFlow/editor/FlowSettings';
import FlowPreview from '@/components/LeadFlow/editor/FlowPreview';
import EnhancedDragDrop from '@/components/LeadFlow/editor/EnhancedDragDrop';
import OptInFlowWizard from '@/components/LeadFlow/editor/OptInFlowWizard';
import LogicBuilder from '@/components/LeadFlow/editor/LogicBuilder';

interface FlowData extends Omit<Flow, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  steps: Array<Omit<FlowStep, 'id' | 'flow_id' | 'created_at' | 'updated_at'> & {
    id?: string;
    tempId?: string;
    fields: Array<Omit<FlowField, 'id' | 'step_id' | 'created_at' | 'updated_at'> & {
      id?: string;
      tempId?: string;
    }>;
  }>;
}

export default function FlowEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [flow, setFlow] = useState<FlowData>({
    name: '',
    slug: '',
    description: '',
    status: FlowStatus.DRAFT,
    settings: {},
    google_ads_config: {},
    style_config: {
      primaryColor: '#3B82F6',
      backgroundColor: '#F8FAFC',
      buttonStyle: 'rounded',
      layout: 'centered'
    },
    steps: []
  });
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadFlow(id);
    }
  }, [id, isNew]);

  // Auto-open Quick Edit when ?quick=1 is present
  useEffect(() => {
    if (!isNew && searchParams.get('quick') === '1') {
      setShowQuickEdit(true);
    }
  }, [isNew, searchParams]);

  const loadFlow = async (flowId: string) => {
    try {
      const { data: flowData, error } = await supabase
        .from('flows')
        .select(`
          *,
          steps:flow_steps(
            *,
            fields:flow_fields(*)
          )
        `)
        .eq('id', flowId)
        .single();

      if (error) throw error;

      if (flowData) {
        // Sort steps and fields
        flowData.steps.sort((a: any, b: any) => a.step_order - b.step_order);
        flowData.steps.forEach((step: any) => {
          step.fields?.sort((a: any, b: any) => a.field_order - b.field_order);
        });
        
        console.log('Loaded flow:', {
          id: flowData.id,
          name: flowData.name,
          stepsCount: flowData.steps.length
        });
        
        setFlow(flowData as FlowData);
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      toast({
        title: "Error",
        description: "Could not load flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/flow/${flow.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Flow URL copied to clipboard!",
      });
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: "Error",
        description: "Could not copy URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    console.log('handleSave called (versioned)');
    if (!flow.name || !flow.slug) {
      toast({ title: 'Error', description: 'Please provide a name and slug for the flow.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload: FlowPayload = {
        id: flow.id,
        name: flow.name,
        slug: flow.slug,
        description: flow.description,
        status: flow.status,
        settings: flow.settings as any,
        google_ads_config: (flow as any).google_ads_config || {},
        style_config: (flow as any).style_config || {},
        steps: (flow.steps || []).map((s, idx) => ({
          id: s.id || s.tempId || `${idx}`,
          step_order: s.step_order ?? idx + 1,
          step_type: s.step_type as any,
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          button_text: s.button_text,
          is_required: s.is_required,
          skip_logic: s.skip_logic as any,
          navigation_logic: s.navigation_logic as any,
          validation_rules: s.validation_rules as any,
          settings: s.settings as any,
          redirect_url: s.redirect_url as any,
          redirect_delay: s.redirect_delay as any,
          fields: (s.fields || []).map((f, fidx) => ({
            id: f.id || f.tempId || `${idx}-${fidx}`,
            field_type: f.field_type as any,
            field_name: f.field_name,
            label: f.label as any,
            placeholder: f.placeholder as any,
            help_text: f.help_text as any,
            is_required: f.is_required as any,
            validation_rules: f.validation_rules as any,
            options: f.options as any,
            default_value: f.default_value as any,
            conditional_logic: f.conditional_logic as any,
          })),
        })),
        logic: ((flow as any).logic || []) as any,
        metadata: (flow as any).metadata || {},
      };
      const saved = await FlowService.saveDraft(flow.id || null, payload);
      setFlow(prev => ({ ...prev, id: saved.flowId } as any));
      if (isNew) navigate(`/admin/flows/${saved.flowId}/edit`);
      toast({ title: 'Saved', description: `Draft version ${saved.version} saved.` });
    } catch (e: any) {
      console.error('Save failed', e);
      toast({ title: 'Error', description: e?.message || 'Could not save draft', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (!flow.name || !flow.slug) {
        toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
        return;
      }
      // Basic pre-publish validation
      const errors: string[] = [];
      if (!flow.steps || flow.steps.length === 0) {
        errors.push('Add at least one step.');
      }
      // Require thank you step or redirect on last step
      if (flow.steps && flow.steps.length > 0) {
        const last = flow.steps[flow.steps.length - 1];
        const hasThankYou = flow.steps.some(s => s.step_type === StepType.THANK_YOU);
        const hasRedirect = !!last.redirect_url;
        if (!hasThankYou && !hasRedirect) {
          errors.push('Add a Thank You step or a redirect URL on the final step.');
        }
      }
      if (errors.length) {
        toast({ title: 'Fix before publishing', description: errors.join(' '), variant: 'destructive' });
        return;
      }
      // Build versioned payload from current editor state
      const payload: FlowPayload = {
        id: flow.id,
        name: flow.name,
        slug: flow.slug,
        description: flow.description,
        status: flow.status,
        settings: flow.settings as any,
        google_ads_config: (flow as any).google_ads_config || {},
        style_config: (flow as any).style_config || {},
        steps: (flow.steps || []).map((s, idx) => ({
          id: s.id || s.tempId || `${idx}`,
          step_order: s.step_order ?? idx + 1,
          step_type: s.step_type as any,
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          button_text: s.button_text,
          is_required: s.is_required,
          skip_logic: s.skip_logic as any,
          navigation_logic: s.navigation_logic as any,
          validation_rules: s.validation_rules as any,
          settings: s.settings as any,
          redirect_url: s.redirect_url as any,
          redirect_delay: s.redirect_delay as any,
          fields: (s.fields || []).map((f, fidx) => ({
            id: f.id || f.tempId || `${idx}-${fidx}`,
            field_type: f.field_type as any,
            field_name: f.field_name,
            label: f.label as any,
            placeholder: f.placeholder as any,
            help_text: f.help_text as any,
            is_required: f.is_required as any,
            validation_rules: f.validation_rules as any,
            options: f.options as any,
            default_value: f.default_value as any,
            conditional_logic: f.conditional_logic as any,
          })),
        })),
        logic: [],
        metadata: (flow as any).metadata || {},
      };

      const saved = await FlowService.saveDraft(flow.id || null, payload);
      const pub = await FlowService.publish(saved.flowId);
      toast({ title: 'Published', description: `Version ${pub.version} is now live.` });
    } catch (e: any) {
      console.error('Publish failed', e);
      toast({ title: 'Publish failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  const addStep = (type: StepType) => {
    const newStep = {
      tempId: Date.now().toString(),
      step_order: flow.steps.length + 1,
      step_type: type,
      title: '',
      subtitle: '',
      content: '',
      button_text: 'Next',
      is_required: true,
      skip_logic: {},
      navigation_logic: {},
      validation_rules: {},
      fields: []
    };

    setFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index: number, updates: any) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
    if (showPreview) {
      triggerAutoSave();
    }
  };

  const deleteStep = (index: number) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const duplicateStep = (index: number) => {
    const stepToDuplicate = flow.steps[index];
    const newStep = {
      ...stepToDuplicate,
      tempId: Date.now().toString(),
      id: undefined,
      fields: stepToDuplicate.fields.map(field => ({
        ...field,
        tempId: Date.now().toString() + Math.random(),
        id: undefined
      }))
    };

    setFlow(prev => ({
      ...prev,
      steps: [
        ...prev.steps.slice(0, index + 1),
        newStep,
        ...prev.steps.slice(index + 1)
      ]
    }));
  };



  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    // For new flows, append a timestamp to avoid conflicts
    if (isNew && baseSlug) {
      const timestamp = Date.now().toString().slice(-6);
      return `${baseSlug}-${timestamp}`;
    }
    
    return baseSlug;
  };

  // Auto-save functionality for preview
  const triggerAutoSave = () => {
    console.log('triggerAutoSave called');
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log('Auto-save timer fired', { isNew, showPreview, hasName: !!flow.name, hasSlug: !!flow.slug });
      if (!isNew && flow.name && flow.slug && showPreview) {
        console.log('Auto-save calling handleSave');
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/flows')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Flows
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New Flow' : 'Edit Flow'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showPreview ? "default" : "outline"}
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <PanelRightClose className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            {!isNew && (
              <Button
                variant="outline"
                onClick={() => setShowQuickEdit(true)}
                className="flex items-center gap-2"
                title="Quick Edit"
              >
                <Settings className="w-4 h-4" />
                Quick Edit
              </Button>
            )}
            {!isNew && (
              <Button
                variant="outline"
                onClick={() => setShowQuickEdit(true)}
                className="flex items-center gap-2"
                title="Add Module (use Quick Edit to confirm)"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </Button>
            )}
            {!isNew && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2"
                  disabled={!flow.slug}
                >
                  <Link className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/flow/${flow.slug}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  External Preview
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                console.log('Save button clicked!');
                handleSave();
              }}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Flow'}
            </Button>
            <Button variant="secondary" onClick={handlePublish} className="flex items-center gap-2">
              Publish
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 ${showPreview ? 'grid-cols-12' : 'grid-cols-12'}`}>
          {/* Main Content */}
          <div className={showPreview ? "col-span-5" : "col-span-8"}>
            <Tabs defaultValue="steps" className="space-y-4">
              <TabsList>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="logic">Logic</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="space-y-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Flow Name</Label>
                      <Input
                        id="name"
                        value={flow.name}
                        onChange={(e) => {
                          setFlow(prev => ({
                            ...prev,
                            name: e.target.value,
                            slug: isNew ? generateSlug(e.target.value) : prev.slug
                          }));
                          if (showPreview) {
                            triggerAutoSave();
                          }
                        }}
                        placeholder="e.g., Quick Housing Search"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={flow.slug}
                        onChange={(e) => setFlow(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., quick-housing-search"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        URL: /flow/{flow.slug || 'your-slug'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be unique. Letters, numbers and hyphens only.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={flow.description || ''}
                        onChange={(e) => setFlow(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this flow"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={flow.status}
                        onValueChange={(value: FlowStatus) => 
                          setFlow(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FlowStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={FlowStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={FlowStatus.PAUSED}>Paused</SelectItem>
                          <SelectItem value={FlowStatus.ARCHIVED}>Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>Flow Steps</CardTitle>
                    <CardDescription>
                      Drag to reorder steps. Each step guides the user through your flow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnhancedDragDrop
                      items={flow.steps}
                      onReorder={(reorderedSteps) => {
                        const updatedSteps = reorderedSteps.map((step, index) => ({
                          ...step,
                          step_order: index
                        }));
                        setFlow(prev => ({ ...prev, steps: updatedSteps }));
                        if (showPreview) {
                          triggerAutoSave();
                        }
                      }}
                      renderItem={(step, index, dragHandleProps) => (
                        <StepEditor
                          step={step}
                          index={index}
                          onUpdate={(updates) => updateStep(index, updates)}
                          onDelete={() => deleteStep(index)}
                          onDuplicate={() => duplicateStep(index)}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                      className="space-y-4"
                      emptyState={
                        <div className="text-center py-8 text-gray-500">
                          No steps yet. Add your first step below.
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logic">
                <Card>
                  <CardHeader>
                    <CardTitle>Conditional Logic</CardTitle>
                    <CardDescription>Define when steps/fields show using simple rules.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LogicBuilder
                      value={(flow as any).logic || []}
                      onChange={(rules) => setFlow(prev => ({ ...(prev as any), logic: rules }))}
                      steps={flow.steps as any}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design">
                <Card>
                  <CardHeader>
                    <CardTitle>Design</CardTitle>
                    <CardDescription>Brand colors, typography, and layout.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">Use Settings for now. Dedicated design tab will consolidate style configuration.</div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>Google Ads, webhooks, and exports.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">Configuration surfaces will appear here.</div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <FlowSettings
                  flow={flow}
                  onUpdate={(updates) => {
                    setFlow(prev => ({ ...prev, ...updates }));
                    if (showPreview) {
                      triggerAutoSave();
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="publish">
                <Card>
                  <CardHeader>
                    <CardTitle>Publish</CardTitle>
                    <CardDescription>Validate and publish to make your flow live.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      <li>Name and slug are set</li>
                      <li>At least one step</li>
                      <li>Thank you step or redirect configured</li>
                    </ul>
                    <Button onClick={handlePublish}>Run Checks & Publish</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="col-span-4 h-[calc(100vh-200px)]">
              <FlowPreview
                flow={flow as any}
                isVisible={showPreview}
                onClose={() => setShowPreview(false)}
                className="h-full"
              />
            </div>
          )}

          {/* Sidebar */}
          <div className={`${showPreview ? "col-span-3" : "col-span-4"} space-y-4`}>
            <Card>
              <CardHeader>
                <CardTitle>Add Step</CardTitle>
                <CardDescription>
                  Choose a step type to add to your flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.FORM)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Form
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.QUIZ)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Quiz
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.CONTENT)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Content
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.RATING)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Rating
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.VIDEO)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.FILE_UPLOAD)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    File Upload
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.THANK_YOU)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thank You
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addStep(StepType.SINGLE_PAGE_LANDING)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Landing Page
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Click any button to add a new step to your flow
                </p>
              </CardContent>
            </Card>

            {/* Quick Edit wizard entry */}
            {!isNew && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Edit (Wizard)</CardTitle>
                  <CardDescription>Update landing layout, fields, theme, and redirect fast.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => setShowQuickEdit(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Open Quick Edit
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{showPreview ? 'Preview Tips' : 'Tips'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                {showPreview ? (
                  <>
                    <p>• Use the device icons to test responsive design</p>
                    <p>• Click the step dots to navigate between steps</p>
                    <p>• Changes update the preview automatically</p>
                    <p>• Click refresh to reset form data</p>
                    <p>• Use fullscreen mode for detailed testing</p>
                  </>
                ) : (
                  <>
                    <p>• Keep forms short - ask only what you need</p>
                    <p>• Use quiz steps to personalize the experience</p>
                    <p>• Add a compelling thank you page</p>
                    <p>• Test your flow before making it active</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Edit Wizard */}
      <OptInFlowWizard
        open={showQuickEdit}
        onOpenChange={setShowQuickEdit}
        onCompleted={() => {
          if (id) loadFlow(id);
        }}
        flowId={id}
      />
    </div>
  );
}