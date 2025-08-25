import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Copy, BarChart, Settings, Database, Users, Megaphone, Link, HelpCircle, ChevronDown, ChevronUp, Play, CheckCircle, Zap, Sparkles, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Flow, FlowStatus } from '@/types/leadFlow';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FlowTemplateGallery from '@/components/LeadFlow/editor/FlowTemplateGallery';
import OptInFlowWizard from '@/components/LeadFlow/editor/OptInFlowWizard';
import UnifiedFlowBuilder from '@/components/LeadFlow/UnifiedFlowBuilder';
import { MigrationService } from '@/services/migrationService';

export default function FlowBuilder() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<{
    total: number;
    migrated: number;
    needingMigration: number;
  } | null>(null);

  useEffect(() => {
    loadFlows();
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await MigrationService.getMigrationStatus();
      setMigrationStatus({
        total: status.totalFlows,
        migrated: status.migratedFlows,
        needingMigration: status.needingMigration
      });
    } catch (error) {
      console.error('Failed to check migration status:', error);
    }
  };

  const loadFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
    } catch (error) {
      console.error('Error loading flows:', error);
      toast({
        title: "Error",
        description: "Could not load flows. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    setEditingFlowId(null);
    setEditingFlowId('new'); // This will trigger the unified builder
  };

  const handleEditFlow = (flowId: string) => {
    setEditingFlowId(flowId);
  };

  const handleBackToList = () => {
    setEditingFlowId(null);
  };

  const handleFlowSaved = (flowId: string) => {
    loadFlows(); // Refresh the list
    toast({
      title: "Flow Saved",
      description: "Your flow has been saved as draft."
    });
  };

  const handleFlowPublished = (flowId: string) => {
    loadFlows(); // Refresh the list
    toast({
      title: "Flow Published!",
      description: "Your flow is now live and available to users."
    });
  };

  const handleCreateQuickOptIn = () => {
    setShowWizard(true);
  };

  const handleCreateGuide = () => {
    setShowWizard(true);
  };

  const handleSelectTemplate = async (template: any) => {
    // Create new flow with template data
    if (template.id === 'blank') {
      navigate('/admin/flows/new/edit');
    } else {
      // Create flow with template steps
      try {
        const { data: newFlow, error: flowError } = await supabase
          .from('flows')
          .insert({
            name: template.name,
            slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            description: template.description,
            status: 'draft' as FlowStatus,
            settings: {},
            google_ads_config: {},
            style_config: {
              primaryColor: '#3B82F6',
              backgroundColor: '#F8FAFC',
              buttonStyle: 'rounded',
              layout: 'centered'
            }
          })
          .select()
          .single();

        if (flowError) throw flowError;

        // Add template steps
        if (template.steps && template.steps.length > 0) {
          for (let stepIndex = 0; stepIndex < template.steps.length; stepIndex++) {
            const templateStep = template.steps[stepIndex];
            const { data: newStep, error: stepError } = await supabase
              .from('flow_steps')
              .insert({
                flow_id: newFlow.id,
                step_order: stepIndex,
                step_type: templateStep.step_type,
                title: templateStep.title,
                subtitle: templateStep.subtitle,
                content: templateStep.content,
                button_text: templateStep.button_text || 'Next',
                is_required: true,
                settings: templateStep.settings || {},
                redirect_url: templateStep.redirect_url,
                redirect_delay: templateStep.redirect_delay
              })
              .select()
              .single();

            if (stepError) throw stepError;

            // Add fields for the step
            if (templateStep.fields && templateStep.fields.length > 0) {
              for (let fieldIndex = 0; fieldIndex < templateStep.fields.length; fieldIndex++) {
                const templateField = templateStep.fields[fieldIndex];
                await supabase
                  .from('flow_fields')
                  .insert({
                    step_id: newStep.id,
                    field_order: fieldIndex,
                    field_type: templateField.field_type,
                    field_name: templateField.field_name,
                    label: templateField.label,
                    placeholder: templateField.placeholder,
                    help_text: templateField.help_text,
                    is_required: templateField.is_required,
                    validation_rules: templateField.validation_rules || {},
                    options: templateField.options || [],
                    default_value: templateField.default_value || ''
                  });
              }
            }
          }
        }

        toast({
          title: "Success",
          description: "Flow created from template successfully!",
        });

        // Navigate to edit the new flow
        navigate(`/admin/flows/${newFlow.id}/edit`);
      } catch (error) {
        console.error('Error creating flow from template:', error);
        toast({
          title: "Error",
          description: "Could not create flow from template. Please try again.",
          variant: "destructive",
        });
      }
    }
    setShowTemplateGallery(false);
  };

  const handleDuplicateFlow = async (flow: Flow) => {
    try {
      const { data: newFlow, error: flowError } = await supabase
        .from('flows')
        .insert({
          name: `${flow.name} (Copy)`,
          slug: `${flow.slug}-copy-${Date.now()}`,
          description: flow.description,
          status: 'draft' as FlowStatus,
          settings: flow.settings,
          google_ads_config: flow.google_ads_config,
          style_config: flow.style_config,
        })
        .select()
        .single();

      if (flowError) throw flowError;

      // Copy steps and fields
      const { data: steps } = await supabase
        .from('flow_steps')
        .select('*, fields:flow_fields(*)')
        .eq('flow_id', flow.id);

      if (steps) {
        for (const step of steps) {
          const { data: newStep, error: stepError } = await supabase
            .from('flow_steps')
            .insert({
              flow_id: newFlow.id,
              step_order: step.step_order,
              step_type: step.step_type,
              title: step.title,
              subtitle: step.subtitle,
              content: step.content,
              button_text: step.button_text,
              is_required: step.is_required,
              skip_logic: step.skip_logic,
              navigation_logic: step.navigation_logic,
              validation_rules: step.validation_rules,
            })
            .select()
            .single();

          if (stepError) throw stepError;

          // Copy fields for this step
          if (step.fields && step.fields.length > 0) {
            const fieldsToInsert = step.fields.map((field: any) => ({
              step_id: newStep.id,
              field_order: field.field_order,
              field_type: field.field_type,
              field_name: field.field_name,
              label: field.label,
              placeholder: field.placeholder,
              help_text: field.help_text,
              is_required: field.is_required,
              validation_rules: field.validation_rules,
              options: field.options,
              default_value: field.default_value,
              conditional_logic: field.conditional_logic,
            }));

            const { error: fieldsError } = await supabase
              .from('flow_fields')
              .insert(fieldsToInsert);

            if (fieldsError) throw fieldsError;
          }
        }
      }

      toast({
        title: "Success",
        description: "Flow duplicated successfully!",
      });

      loadFlows();
    } catch (error) {
      console.error('Error duplicating flow:', error);
      toast({
        title: "Error",
        description: "Could not duplicate flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportFlow = async (flow: Flow) => {
    try {
      const { data: steps } = await supabase
        .from('flow_steps')
        .select('*, fields:flow_fields(*)')
        .eq('flow_id', flow.id)
        .order('step_order', { ascending: true });
      const blob = new Blob([JSON.stringify({ flow, steps }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flow.slug}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to export flow', variant: 'destructive' });
    }
  };

  const handleImportFlow = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const base = parsed.flow as Flow;
      const steps = parsed.steps as any[];
      // Create flow
      const { data: newFlow, error: flowError } = await supabase
        .from('flows')
        .insert({
          name: `${base.name} (Imported)` ,
          slug: `${base.slug}-import-${Date.now()}`,
          description: base.description,
          status: 'draft' as FlowStatus,
          style_config: base.style_config,
          google_ads_config: base.google_ads_config,
          metadata: base.metadata
        })
        .select()
        .single();
      if (flowError) throw flowError;
      // Insert steps
      for (const s of steps) {
        const { data: newStep, error: stepError } = await supabase
          .from('flow_steps')
          .insert({
            flow_id: newFlow.id,
            step_order: s.step_order,
            step_type: s.step_type,
            title: s.title,
            subtitle: s.subtitle,
            content: s.content,
            button_text: s.button_text,
            is_required: s.is_required,
            skip_logic: s.skip_logic,
            navigation_logic: s.navigation_logic,
            validation_rules: s.validation_rules,
            redirect_url: s.redirect_url,
            redirect_delay: s.redirect_delay,
            settings: s.settings
          })
          .select()
          .single();
        if (stepError) throw stepError;
        if (s.fields && s.fields.length > 0) {
          const fieldsToInsert = s.fields.map((f: any) => ({
            step_id: newStep.id,
            field_order: f.field_order,
            field_type: f.field_type,
            field_name: f.field_name,
            label: f.label,
            placeholder: f.placeholder,
            help_text: f.help_text,
            is_required: f.is_required,
            validation_rules: f.validation_rules,
            options: f.options,
            default_value: f.default_value,
            conditional_logic: f.conditional_logic,
          }));
          const { error: fieldsError } = await supabase.from('flow_fields').insert(fieldsToInsert);
          if (fieldsError) throw fieldsError;
        }
      }
      toast({ title: 'Imported', description: 'Flow imported successfully' });
      loadFlows();
    } catch (e: any) {
      console.error('Import failed', e);
      toast({ title: 'Error', description: e?.message || 'Failed to import', variant: 'destructive' });
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm('Are you sure you want to delete this flow? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flow deleted successfully!",
      });

      loadFlows();
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: "Error",
        description: "Could not delete flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async (slug: string) => {
    const url = `${window.location.origin}/flow/${slug}`;
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

  const getStatusColor = (status: FlowStatus) => {
    switch (status) {
      case FlowStatus.ACTIVE:
        return 'bg-green-500';
      case FlowStatus.PAUSED:
        return 'bg-yellow-500';
      case FlowStatus.DRAFT:
        return 'bg-gray-500';
      case FlowStatus.ARCHIVED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Show unified flow builder when editing or creating
  if (editingFlowId) {
    return (
      <UnifiedFlowBuilder
        flowId={editingFlowId === 'new' ? undefined : editingFlowId}
        onSaved={(flowId) => {
          handleFlowSaved(flowId);
          handleBackToList();
        }}
        onPublished={(flowId) => {
          handleFlowPublished(flowId);
          handleBackToList();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Flows</h1>
            <p className="text-gray-600 mt-2">Create and manage your lead capture flows</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateFlow} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/data-admin')}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Data Import
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            disabled
          >
            <Megaphone className="w-4 h-4" />
            Lead Flows
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/leads')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Leads
          </Button>
        </div>

        {/* How To Guide */}
        <Collapsible open={showHowTo} onOpenChange={setShowHowTo}>
          <CollapsibleContent>
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Play className="w-5 h-5" />
                  How to Create a Lead Flow - Step by Step
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Follow this guide to build your first high-converting lead capture flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Choose Your Flow Type</h3>
                    <p className="text-gray-700 mb-3">Start by clicking "Create New Flow" above. You'll have several step types to choose from:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border">
                        <strong>Form Step</strong><br/>
                        Collect user information
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <strong>Quiz Step</strong><br/>
                        Interactive questions
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <strong>Content Step</strong><br/>
                        Display information
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <strong>Single Page Landing</strong><br/>
                        Complete landing page
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Configure Your Steps</h3>
                    <p className="text-gray-700 mb-3">Add and customize each step in your flow:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Add form fields (name, email, phone, etc.)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Set up quiz questions with visual options
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Customize text, colors, and styling
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Configure validation rules
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Use Live Preview</h3>
                    <p className="text-gray-700 mb-3">Test your flow in real-time using the preview panel:</p>
                    <div className="bg-white p-3 rounded-lg border text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <strong>Pro Tip:</strong>
                      </div>
                      <p className="text-gray-600">
                        Click "Show Preview" to see your flow on desktop, tablet, and mobile. 
                        Changes update automatically as you edit!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Publish & Share</h3>
                    <p className="text-gray-700 mb-3">When you're ready to go live:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Set status to "Active" to make it live
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Copy the flow URL to share
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Monitor performance in the stats above
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        View collected leads in the Leads section
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quick Start Templates */}
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">🚀 Quick Start Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded border-green-200 border">
                      <strong className="text-green-800">Section 8 Housing</strong><br/>
                      <span className="text-green-600">Pre-built for housing assistance applications</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded border-purple-200 border">
                      <strong className="text-purple-800">General Lead Capture</strong><br/>
                      <span className="text-purple-600">Perfect for service inquiries and contact forms</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex justify-center pt-4">
                  <Button onClick={handleCreateFlow} size="lg" className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Your First Flow Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flows.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flows.filter(f => f.status === FlowStatus.ACTIVE).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flows.reduce((sum, f) => sum + (f.total_views || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flows.length > 0 
                  ? (flows.reduce((sum, f) => sum + (f.conversion_rate || 0), 0) / flows.length).toFixed(1)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flows Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Flows</CardTitle>
            <CardDescription>Manage your lead capture flows and view their performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : flows.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to capture your first lead?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a professional lead capture flow in minutes. No coding required!
                  </p>
                  
                  <div className="space-y-4">
                    <Button onClick={handleCreateFlow} size="lg" className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create Your First Flow
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setShowHowTo(true)}
                        className="text-blue-600"
                      >
                        Need help? View the step-by-step guide →
                      </Button>
                    </div>
                  </div>

                  {/* Quick benefits */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium text-green-800">Easy Setup</div>
                      <div className="text-green-600">Built in minutes</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-800">Live Preview</div>
                      <div className="text-blue-600">See as you build</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="font-medium text-purple-800">Mobile Ready</div>
                      <div className="text-purple-600">Works everywhere</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Completions</TableHead>
                    <TableHead className="text-center">Conversion</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flows.map((flow) => (
                    <TableRow key={flow.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{flow.name}</div>
                          <div className="text-sm text-gray-600">{flow.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(flow.status as FlowStatus)} text-white`}>
                          {flow.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{flow.total_views || 0}</TableCell>
                      <TableCell className="text-center">{flow.total_completions || 0}</TableCell>
                      <TableCell className="text-center">
                        {flow.conversion_rate?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell>
                        {new Date(flow.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/flow/${flow.slug}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyUrl(flow.slug)}>
                              <Link className="w-4 h-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditFlow(flow.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate(`/admin/leads?flow=${flow.id}`)}>
              <BarChart className="w-4 h-4 mr-2" />
              View Leads
            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateFlow(flow)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportFlow(flow)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFlow(flow.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simplified: legacy creation modals removed */}
    </div>
  );
}