import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Zap, Plus, Settings, TestTube, CheckCircle, XCircle, Clock,
  Salesforce, Mail, Globe, Slack, ArrowRight, TrendingUp,
  Database, Webhook, Users, BarChart3
} from 'lucide-react';
import { IntegrationService, Integration, FlowMapping } from '@/services/integrationService';
import { toast } from '@/hooks/use-toast';

interface IntegrationHubProps {
  className?: string;
}

export default function IntegrationHub({ className }: IntegrationHubProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Create integration form
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'salesforce' as Integration['type'],
    config: {} as any
  });

  const integrationTypes = [
    { 
      value: 'salesforce', 
      label: 'Salesforce', 
      icon: Database,
      description: 'Sync leads to Salesforce CRM',
      color: 'bg-blue-500'
    },
    { 
      value: 'hubspot', 
      label: 'HubSpot', 
      icon: Users,
      description: 'Sync contacts to HubSpot',
      color: 'bg-orange-500'
    },
    { 
      value: 'webhook', 
      label: 'Custom Webhook', 
      icon: Webhook,
      description: 'Send data to any HTTP endpoint',
      color: 'bg-purple-500'
    },
    { 
      value: 'email', 
      label: 'Email SMTP', 
      icon: Mail,
      description: 'Send automated emails',
      color: 'bg-green-500'
    },
    { 
      value: 'slack', 
      label: 'Slack', 
      icon: Slack,
      description: 'Send notifications to Slack',
      color: 'bg-pink-500'
    },
    { 
      value: 'zapier', 
      label: 'Zapier', 
      icon: Zap,
      description: 'Connect to 5000+ apps via Zapier',
      color: 'bg-yellow-500'
    }
  ];

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await IntegrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleCreateIntegration = async () => {
    try {
      const result = await IntegrationService.createIntegration(createForm);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Integration created successfully"
        });
        setShowCreateDialog(false);
        setCreateForm({ name: '', type: 'salesforce', config: {} });
        loadIntegrations();
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(', ') || "Failed to create integration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive"
      });
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    setTestingId(integrationId);
    try {
      const result = await IntegrationService.testIntegration(integrationId);
      
      toast({
        title: result.success ? "Test Successful" : "Test Failed",
        description: result.success 
          ? "Integration is working correctly"
          : result.errors?.join(', ') || "Integration test failed",
        variant: result.success ? "default" : "destructive"
      });

      if (result.success) {
        // Update integration status in state
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integrationId 
              ? { ...int, status: 'active' }
              : int
          )
        );
      }
    } catch (error) {
      console.error('Failed to test integration:', error);
      toast({
        title: "Error",
        description: "Failed to test integration",
        variant: "destructive"
      });
    } finally {
      setTestingId(null);
    }
  };

  const getIntegrationIcon = (type: Integration['type']) => {
    const typeInfo = integrationTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || Globe;
    return <Icon className="w-5 h-5" />;
  };

  const getIntegrationColor = (type: Integration['type']) => {
    return integrationTypes.find(t => t.value === type)?.color || 'bg-gray-500';
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderConfigForm = () => {
    const selectedType = integrationTypes.find(t => t.value === createForm.type);
    
    switch (createForm.type) {
      case 'salesforce':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sf-client-id">Client ID *</Label>
                <Input
                  id="sf-client-id"
                  value={createForm.config.clientId || ''}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, clientId: e.target.value }
                  })}
                  placeholder="Your Salesforce App Client ID"
                />
              </div>
              <div>
                <Label htmlFor="sf-client-secret">Client Secret *</Label>
                <Input
                  id="sf-client-secret"
                  type="password"
                  value={createForm.config.clientSecret || ''}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, clientSecret: e.target.value }
                  })}
                  placeholder="Your Salesforce App Client Secret"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sf-sandbox"
                checked={createForm.config.sandbox || false}
                onCheckedChange={(checked) => setCreateForm({
                  ...createForm,
                  config: { ...createForm.config, sandbox: checked }
                })}
              />
              <Label htmlFor="sf-sandbox">Use Sandbox Environment</Label>
            </div>
          </div>
        );

      case 'hubspot':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="hs-api-key">API Key *</Label>
              <Input
                id="hs-api-key"
                type="password"
                value={createForm.config.apiKey || ''}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  config: { ...createForm.config, apiKey: e.target.value }
                })}
                placeholder="Your HubSpot API Key"
              />
            </div>
            <div>
              <Label htmlFor="hs-portal-id">Portal ID *</Label>
              <Input
                id="hs-portal-id"
                value={createForm.config.portalId || ''}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  config: { ...createForm.config, portalId: e.target.value }
                })}
                placeholder="Your HubSpot Portal ID"
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL *</Label>
              <Input
                id="webhook-url"
                value={createForm.config.url || ''}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  config: { ...createForm.config, url: e.target.value }
                })}
                placeholder="https://your-app.com/webhook"
              />
            </div>
            <div>
              <Label htmlFor="webhook-method">HTTP Method</Label>
              <Select 
                value={createForm.config.method || 'POST'} 
                onValueChange={(value) => setCreateForm({
                  ...createForm,
                  config: { ...createForm.config, method: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host *</Label>
                <Input
                  id="smtp-host"
                  value={createForm.config.smtpHost || ''}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, smtpHost: e.target.value }
                  })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={createForm.config.smtpPort || 587}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, smtpPort: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-username">Username *</Label>
                <Input
                  id="smtp-username"
                  value={createForm.config.username || ''}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, username: e.target.value }
                  })}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">Password *</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={createForm.config.password || ''}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    config: { ...createForm.config, password: e.target.value }
                  })}
                  placeholder="Your app password"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Configuration options for {selectedType?.label} will be available soon.
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading integrations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Hub</h1>
          <p className="text-gray-600 mt-1">Connect your flows to CRMs, email, and other services</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Integration</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration-name">Integration Name *</Label>
                  <Input
                    id="integration-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Primary Salesforce"
                  />
                </div>
                <div>
                  <Label htmlFor="integration-type">Type *</Label>
                  <Select 
                    value={createForm.type} 
                    onValueChange={(value: Integration['type']) => setCreateForm({ 
                      ...createForm, 
                      type: value,
                      config: {} // Reset config when type changes
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypes.map((type) => (
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

              <Separator />

              <div>
                <Label className="text-base font-medium">Configuration</Label>
                <div className="mt-3">
                  {renderConfigForm()}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIntegration}>
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Active Integrations</TabsTrigger>
          <TabsTrigger value="available">Available Services</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Active Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Connect your first service to automatically sync lead data
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getIntegrationColor(integration.type)}`}>
                          <div className="text-white">
                            {getIntegrationIcon(integration.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{integration.name}</h3>
                            <Badge className={getStatusColor(integration.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(integration.status)}
                                {integration.status}
                              </div>
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {integrationTypes.find(t => t.value === integration.type)?.description}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total Syncs</span>
                              <div className="font-semibold">{integration.stats.totalSyncs.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Success Rate</span>
                              <div className="font-semibold">
                                {integration.stats.totalSyncs > 0 
                                  ? Math.round((integration.stats.successfulSyncs / integration.stats.totalSyncs) * 100)
                                  : 0}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Avg Response</span>
                              <div className="font-semibold">{integration.stats.averageResponseTime}ms</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Sync</span>
                              <div className="font-semibold">
                                {integration.lastSync 
                                  ? new Date(integration.lastSync).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Progress bar for success rate */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Success Rate</span>
                              <span>
                                {integration.stats.successfulSyncs} / {integration.stats.totalSyncs}
                              </span>
                            </div>
                            <Progress 
                              value={
                                integration.stats.totalSyncs > 0 
                                  ? (integration.stats.successfulSyncs / integration.stats.totalSyncs) * 100
                                  : 0
                              } 
                              className="h-2"
                            />
                          </div>

                          {/* Flow mappings */}
                          {integration.flowMappings.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-700">Connected Flows:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {integration.flowMappings.map((mapping) => (
                                  <Badge key={mapping.id} variant="outline" className="text-xs">
                                    {mapping.flowName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Error message */}
                          {integration.status === 'error' && integration.errorMessage && (
                            <Alert className="mt-4">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription>
                                {integration.errorMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestIntegration(integration.id)}
                          disabled={testingId === integration.id}
                        >
                          <TestTube className="w-4 h-4 mr-1" />
                          {testingId === integration.id ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Services Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationTypes.map((type) => (
              <Card key={type.value} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                      <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                      
                      <Button 
                        size="sm"
                        onClick={() => {
                          setCreateForm({ name: `${type.label} Integration`, type: type.value as Integration['type'], config: {} });
                          setShowCreateDialog(true);
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {type.label}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Section */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">More Integrations Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                We're working on adding support for Pipedrive, Monday.com, Airtable, and many more services.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Pipedrive', 'Monday.com', 'Airtable', 'Notion', 'Google Sheets'].map((service) => (
                  <Badge key={service} variant="secondary">{service}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure global integration preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-sync New Leads</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically sync new leads to active integrations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Retry Failed Syncs</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically retry failed synchronization attempts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Sync Frequency</Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  How often to check for new leads to sync
                </p>
                <Select defaultValue="realtime">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">Default Field Mappings</Label>
                <p className="text-sm text-gray-600">
                  Set up common field mappings that will be applied to new integrations
                </p>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Field Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
