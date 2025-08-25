import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain, Plus, Settings, Play, Eye, EyeOff, Trash2, Copy,
  Zap, Target, Users, MessageSquare, ArrowRight, GitBranch,
  Filter, Calculator, Paintbrush, Mail, Webhook
} from 'lucide-react';
import { 
  LogicBuilderService, 
  LogicRule, 
  LogicCondition, 
  LogicAction, 
  PersonalizationProfile,
  LogicFlowAnalytics 
} from '@/services/logicBuilderService';
import { FlowService } from '@/services/flowService';
import { toast } from '@/hooks/use-toast';

interface LogicBuilderProps {
  flowId: string;
  className?: string;
}

export default function LogicBuilder({ flowId, className }: LogicBuilderProps) {
  const [rules, setRules] = useState<LogicRule[]>([]);
  const [profiles, setProfiles] = useState<PersonalizationProfile[]>([]);
  const [analytics, setAnalytics] = useState<LogicFlowAnalytics[]>([]);
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<LogicRule | null>(null);

  // Form states
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'conditional_step' as LogicRule['type'],
    trigger: {
      event: 'step_complete' as const,
      stepId: '',
      fieldId: ''
    },
    conditions: [] as LogicCondition[],
    actions: [] as LogicAction[],
    priority: 1,
    enabled: true
  });

  const ruleTypes = [
    { value: 'conditional_step', label: 'Conditional Step', icon: GitBranch, description: 'Show/hide steps based on user responses' },
    { value: 'field_population', label: 'Smart Field Population', icon: Zap, description: 'Auto-fill fields with intelligent data' },
    { value: 'routing', label: 'Dynamic Routing', icon: Target, description: 'Route users to different paths' },
    { value: 'personalization', label: 'Personalization', icon: Users, description: 'Customize content for different users' },
    { value: 'validation', label: 'Custom Validation', icon: Filter, description: 'Add complex validation rules' }
  ];

  const triggerTypes = [
    { value: 'flow_start', label: 'Flow Start', description: 'When user begins the flow' },
    { value: 'step_enter', label: 'Step Enter', description: 'When user enters a step' },
    { value: 'step_complete', label: 'Step Complete', description: 'When user completes a step' },
    { value: 'field_change', label: 'Field Change', description: 'When a field value changes' },
    { value: 'timer', label: 'Timer', description: 'After a specified time delay' }
  ];

  const conditionOperators = [
    { value: 'equals', label: 'Equals', description: 'Value equals exactly' },
    { value: 'not_equals', label: 'Not Equals', description: 'Value does not equal' },
    { value: 'contains', label: 'Contains', description: 'Text contains substring' },
    { value: 'not_contains', label: 'Not Contains', description: 'Text does not contain' },
    { value: 'greater_than', label: 'Greater Than', description: 'Number is greater' },
    { value: 'less_than', label: 'Less Than', description: 'Number is less' },
    { value: 'is_empty', label: 'Is Empty', description: 'Field is empty or null' },
    { value: 'is_not_empty', label: 'Is Not Empty', description: 'Field has a value' }
  ];

  const actionTypes = [
    { value: 'show_step', label: 'Show Step', icon: Eye, description: 'Make a step visible' },
    { value: 'hide_step', label: 'Hide Step', icon: EyeOff, description: 'Hide a step from user' },
    { value: 'skip_to_step', label: 'Skip to Step', icon: ArrowRight, description: 'Jump to specific step' },
    { value: 'set_field_value', label: 'Set Field Value', icon: Zap, description: 'Auto-populate a field' },
    { value: 'show_message', label: 'Show Message', icon: MessageSquare, description: 'Display a message to user' },
    { value: 'update_styling', label: 'Update Styling', icon: Paintbrush, description: 'Change visual appearance' },
    { value: 'send_email', label: 'Send Email', icon: Mail, description: 'Trigger email notification' },
    { value: 'call_webhook', label: 'Call Webhook', icon: Webhook, description: 'Send data to external service' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, profilesData, analyticsData, flowData] = await Promise.all([
        LogicBuilderService.getFlowLogicRules(flowId),
        LogicBuilderService.getPersonalizationProfiles(flowId),
        LogicBuilderService.getLogicAnalytics(flowId),
        FlowService.getDraftVersion(flowId)
      ]);

      setRules(rulesData);
      setProfiles(profilesData);
      setAnalytics(analyticsData);
      setFlow(flowData.success ? flowData.data : null);
    } catch (error) {
      console.error('Failed to load logic builder data:', error);
      toast({
        title: "Error",
        description: "Failed to load logic builder data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [flowId]);

  const handleCreateRule = async () => {
    try {
      if (!ruleForm.name || ruleForm.conditions.length === 0 || ruleForm.actions.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please provide rule name, conditions, and actions",
          variant: "destructive"
        });
        return;
      }

      const result = await LogicBuilderService.createLogicRule({
        ...ruleForm,
        flowId
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Logic rule created successfully"
        });
        setShowRuleDialog(false);
        resetRuleForm();
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(', ') || "Failed to create logic rule",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
      toast({
        title: "Error",
        description: "Failed to create logic rule",
        variant: "destructive"
      });
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      description: '',
      type: 'conditional_step',
      trigger: {
        event: 'step_complete',
        stepId: '',
        fieldId: ''
      },
      conditions: [],
      actions: [],
      priority: 1,
      enabled: true
    });
    setEditingRule(null);
  };

  const addCondition = () => {
    const newCondition: LogicCondition = {
      id: `cond-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      dataType: 'string',
      logicalOperator: ruleForm.conditions.length > 0 ? 'AND' : undefined
    };
    
    setRuleForm({
      ...ruleForm,
      conditions: [...ruleForm.conditions, newCondition]
    });
  };

  const updateCondition = (index: number, updates: Partial<LogicCondition>) => {
    const updatedConditions = [...ruleForm.conditions];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };
    setRuleForm({ ...ruleForm, conditions: updatedConditions });
  };

  const removeCondition = (index: number) => {
    const updatedConditions = ruleForm.conditions.filter((_, i) => i !== index);
    setRuleForm({ ...ruleForm, conditions: updatedConditions });
  };

  const addAction = () => {
    const newAction: LogicAction = {
      id: `action-${Date.now()}`,
      type: 'show_step',
      config: {}
    };
    
    setRuleForm({
      ...ruleForm,
      actions: [...ruleForm.actions, newAction]
    });
  };

  const updateAction = (index: number, updates: Partial<LogicAction>) => {
    const updatedActions = [...ruleForm.actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    setRuleForm({ ...ruleForm, actions: updatedActions });
  };

  const removeAction = (index: number) => {
    const updatedActions = ruleForm.actions.filter((_, i) => i !== index);
    setRuleForm({ ...ruleForm, actions: updatedActions });
  };

  const getFieldOptions = () => {
    if (!flow?.steps) return [];
    
    const fields: Array<{ value: string; label: string }> = [];
    
    flow.steps.forEach((step: any, stepIndex: number) => {
      if (step.fields) {
        step.fields.forEach((field: any) => {
          fields.push({
            value: field.field_name,
            label: `${field.label || field.field_name} (Step ${stepIndex + 1})`
          });
        });
      }
    });

    return fields;
  };

  const getStepOptions = () => {
    if (!flow?.steps) return [];
    
    return flow.steps.map((step: any, index: number) => ({
      value: step.id,
      label: `Step ${index + 1}: ${step.title || 'Untitled'}`
    }));
  };

  const renderConditionConfig = (condition: LogicCondition, index: number) => (
    <Card key={condition.id} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Condition {index + 1}</h4>
        {index > 0 && (
          <Select 
            value={condition.logicalOperator} 
            onValueChange={(value: 'AND' | 'OR') => updateCondition(index, { logicalOperator: value })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => removeCondition(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Field</Label>
          <Select value={condition.field} onValueChange={(value) => updateCondition(index, { field: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {getFieldOptions().map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Operator</Label>
          <Select value={condition.operator} onValueChange={(value: any) => updateCondition(index, { operator: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditionOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Value</Label>
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            placeholder="Enter value"
          />
        </div>
      </div>
    </Card>
  );

  const renderActionConfig = (action: LogicAction, index: number) => (
    <Card key={action.id} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Action {index + 1}</h4>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => removeAction(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Action Type</Label>
          <Select value={action.type} onValueChange={(value: any) => updateAction(index, { type: value, config: {} })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action-specific configuration */}
        {(['show_step', 'hide_step', 'skip_to_step'].includes(action.type)) && (
          <div>
            <Label>Target Step</Label>
            <Select 
              value={action.config.targetStepId} 
              onValueChange={(value) => updateAction(index, { config: { ...action.config, targetStepId: value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select step" />
              </SelectTrigger>
              <SelectContent>
                {getStepOptions().map((step) => (
                  <SelectItem key={step.value} value={step.value}>
                    {step.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {action.type === 'set_field_value' && (
          <>
            <div>
              <Label>Target Field</Label>
              <Select 
                value={action.config.targetFieldId} 
                onValueChange={(value) => updateAction(index, { config: { ...action.config, targetFieldId: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {getFieldOptions().map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={action.config.value || ''}
                onChange={(e) => updateAction(index, { config: { ...action.config, value: e.target.value } })}
                placeholder="Value to set"
              />
            </div>
          </>
        )}

        {action.type === 'show_message' && (
          <>
            <div>
              <Label>Message</Label>
              <Textarea
                value={action.config.message || ''}
                onChange={(e) => updateAction(index, { config: { ...action.config, message: e.target.value } })}
                placeholder="Message to display"
              />
            </div>
            <div>
              <Label>Message Type</Label>
              <Select 
                value={action.config.messageType || 'info'} 
                onValueChange={(value) => updateAction(index, { config: { ...action.config, messageType: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading logic builder...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logic Builder</h1>
          <p className="text-gray-600 mt-1">Create intelligent, dynamic flow experiences</p>
        </div>

        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetRuleForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Logic Rule</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                    placeholder="e.g., Show Premium Options"
                  />
                </div>
                <div>
                  <Label htmlFor="rule-type">Rule Type *</Label>
                  <Select value={ruleForm.type} onValueChange={(value: any) => setRuleForm({ ...ruleForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  placeholder="Describe what this rule does"
                />
              </div>

              {/* Trigger Configuration */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Trigger</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Event</Label>
                    <Select 
                      value={ruleForm.trigger.event} 
                      onValueChange={(value: any) => setRuleForm({ 
                        ...ruleForm, 
                        trigger: { ...ruleForm.trigger, event: value } 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes.map((trigger) => (
                          <SelectItem key={trigger.value} value={trigger.value}>
                            {trigger.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(['step_enter', 'step_complete'].includes(ruleForm.trigger.event)) && (
                    <div>
                      <Label>Step</Label>
                      <Select 
                        value={ruleForm.trigger.stepId} 
                        onValueChange={(value) => setRuleForm({ 
                          ...ruleForm, 
                          trigger: { ...ruleForm.trigger, stepId: value } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select step" />
                        </SelectTrigger>
                        <SelectContent>
                          {getStepOptions().map((step) => (
                            <SelectItem key={step.value} value={step.value}>
                              {step.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {ruleForm.trigger.event === 'field_change' && (
                    <div>
                      <Label>Field</Label>
                      <Select 
                        value={ruleForm.trigger.fieldId} 
                        onValueChange={(value) => setRuleForm({ 
                          ...ruleForm, 
                          trigger: { ...ruleForm.trigger, fieldId: value } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldOptions().map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Conditions</h3>
                  <Button size="sm" onClick={addCondition}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                {ruleForm.conditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No conditions defined. Add at least one condition to continue.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ruleForm.conditions.map(renderConditionConfig)}
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Actions</h3>
                  <Button size="sm" onClick={addAction}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                
                {ruleForm.actions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No actions defined. Add at least one action to continue.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ruleForm.actions.map(renderActionConfig)}
                  </div>
                )}
              </div>

              <Separator />

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers execute first</p>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="enabled"
                    checked={ruleForm.enabled}
                    onCheckedChange={(checked) => setRuleForm({ ...ruleForm, enabled: checked })}
                  />
                  <Label htmlFor="enabled">Enable Rule</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Logic Rules</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Logic Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Logic Rules Yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Create intelligent rules to make your flows dynamic and personalized
                </p>
                <Button onClick={() => setShowRuleDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => {
                const ruleType = ruleTypes.find(t => t.value === rule.type);
                const RuleIcon = ruleType?.icon || Brain;
                
                return (
                  <Card key={rule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <RuleIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{rule.name}</h3>
                              <Badge variant={rule.enabled ? "default" : "secondary"}>
                                {rule.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{rule.description}</p>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Type</span>
                                <div className="font-medium">{ruleType?.label}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Trigger</span>
                                <div className="font-medium capitalize">
                                  {rule.trigger.event.replace('_', ' ')}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Conditions</span>
                                <div className="font-medium">{rule.conditions.length}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Actions</span>
                                <div className="font-medium">{rule.actions.length}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Personalization Engine</h3>
              <p className="text-gray-600 mb-6">
                Create personalized experiences based on user behavior, demographics, and preferences.
                Show different content, styling, and flow paths to different user segments.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Personalization Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Performance Analytics</CardTitle>
              <CardDescription>Track how your logic rules impact user experience and conversions</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No analytics data available yet. Create and activate some rules to see performance metrics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.map((analytic) => (
                    <div key={analytic.ruleId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{analytic.ruleName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{analytic.executions} executions</span>
                          <span>{analytic.successRate}% success rate</span>
                          <span>{analytic.avgExecutionTime}ms avg time</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Impact on conversion</div>
                        <div className={`font-semibold ${analytic.impactOnConversion > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {analytic.impactOnConversion > 0 ? '+' : ''}{analytic.impactOnConversion}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Lead Scoring</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Automatically score leads based on their responses and behavior
                </p>
                <Button size="sm" className="w-full">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRight className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Progressive Disclosure</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show additional questions based on user's initial responses
                </p>
                <Button size="sm" className="w-full">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">User Segmentation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Route users to different paths based on their profile
                </p>
                <Button size="sm" className="w-full">Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
