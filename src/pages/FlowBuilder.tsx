import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Copy, BarChart, Settings, Database, Users, Megaphone, Link } from 'lucide-react';
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

export default function FlowBuilder() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlows();
  }, []);

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
    navigate('/admin/flows/new/edit');
  };

  const handleEditFlow = (flowId: string) => {
    navigate(`/admin/flows/${flowId}/edit`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Flows</h1>
            <p className="text-gray-600 mt-2">Create and manage your lead capture flows</p>
          </div>
          <Button onClick={handleCreateFlow} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Flow
          </Button>
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
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No flows created yet</p>
                <Button onClick={handleCreateFlow}>Create Your First Flow</Button>
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
    </div>
  );
}