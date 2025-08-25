import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import {
  Play, Pause, Square, Trophy, AlertTriangle, TrendingUp, TrendingDown,
  Users, Target, Clock, Zap, Settings, Eye, Edit, Trash2, Plus
} from 'lucide-react';
import { ABTestService, ABTest, ABTestResults, VariantResults } from '@/services/abTestService';
import { FlowPayload } from '@/types/flowSchema';
import { FlowService } from '@/services/flowService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ABTestManagerProps {
  className?: string;
}

export default function ABTestManager({ className }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<ABTestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);

  // Create test form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    baseFlowId: '',
    hypothesis: '',
    successMetric: 'conversion_rate' as const,
    trafficSplit: 50,
    minSampleSize: 100,
    confidenceLevel: 95
  });

  const loadTests = async () => {
    setLoading(true);
    try {
      const testList = await ABTestService.listTests();
      setTests(testList);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFlows = async () => {
    try {
      const { data: flowList } = await supabase
        .from('flows')
        .select('id, name, slug, status')
        .eq('status', 'published')
        .order('name');
      
      setFlows(flowList || []);
    } catch (error) {
      console.error('Failed to load flows:', error);
    }
  };

  const loadTestResults = async (testId: string) => {
    try {
      const results = await ABTestService.calculateResults(testId);
      setTestResults(results);
    } catch (error) {
      console.error('Failed to load test results:', error);
    }
  };

  useEffect(() => {
    loadTests();
    loadFlows();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadTestResults(selectedTest.id);
    }
  }, [selectedTest]);

  const handleCreateTest = async () => {
    try {
      if (!createForm.baseFlowId || !createForm.name || !createForm.hypothesis) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // For now, create a simple variant by modifying the title
      // In a full implementation, you'd have a flow editor here
      const baseFlow = await FlowService.getDraftVersion(createForm.baseFlowId);
      if (!baseFlow.success || !baseFlow.data) {
        toast({
          title: "Error",
          description: "Could not load base flow",
          variant: "destructive"
        });
        return;
      }

      const variantPayload = {
        ...baseFlow.data,
        name: baseFlow.data.name + ' - Variant',
        steps: baseFlow.data.steps.map((step, index) => 
          index === 0 
            ? { ...step, title: step.title + ' [VARIANT]' }
            : step
        )
      };

      const result = await ABTestService.createTest(createForm.baseFlowId, {
        name: createForm.name,
        description: createForm.description,
        trafficSplit: createForm.trafficSplit,
        hypothesis: createForm.hypothesis,
        successMetric: createForm.successMetric,
        variantFlowPayload: variantPayload,
        minSampleSize: createForm.minSampleSize,
        confidenceLevel: createForm.confidenceLevel
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "A/B test created successfully"
        });
        setShowCreateDialog(false);
        setCreateForm({
          name: '',
          description: '',
          baseFlowId: '',
          hypothesis: '',
          successMetric: 'conversion_rate',
          trafficSplit: 50,
          minSampleSize: 100,
          confidenceLevel: 95
        });
        loadTests();
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(', ') || "Failed to create test",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create test:', error);
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive"
      });
    }
  };

  const handleStartTest = async (testId: string) => {
    const result = await ABTestService.startTest(testId);
    if (result.success) {
      toast({ title: "Success", description: "A/B test started" });
      loadTests();
    } else {
      toast({
        title: "Error",
        description: result.errors?.join(', ') || "Failed to start test",
        variant: "destructive"
      });
    }
  };

  const handlePromoteWinner = async (testId: string, winnerVariantId: string) => {
    const result = await ABTestService.promoteWinner(testId, winnerVariantId);
    if (result.success) {
      toast({ 
        title: "Success", 
        description: "Winner variant promoted to main flow" 
      });
      loadTests();
    } else {
      toast({
        title: "Error",
        description: result.errors?.join(', ') || "Failed to promote winner",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPercent = (num: number) => `${num.toFixed(1)}%`;

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading A/B tests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Testing</h1>
          <p className="text-gray-600 mt-1">Optimize conversion rates with statistical testing</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-name">Test Name *</Label>
                  <Input
                    id="test-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="e.g., Homepage Hero Test"
                  />
                </div>
                <div>
                  <Label htmlFor="base-flow">Base Flow *</Label>
                  <Select value={createForm.baseFlowId} onValueChange={(value) => setCreateForm({...createForm, baseFlowId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flow to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {flows.map((flow) => (
                        <SelectItem key={flow.id} value={flow.id}>
                          {flow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Brief description of what you're testing"
                />
              </div>

              <div>
                <Label htmlFor="hypothesis">Hypothesis *</Label>
                <Textarea
                  id="hypothesis"
                  value={createForm.hypothesis}
                  onChange={(e) => setCreateForm({...createForm, hypothesis: e.target.value})}
                  placeholder="I believe that [change] will result in [outcome] because [reason]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="success-metric">Success Metric</Label>
                  <Select value={createForm.successMetric} onValueChange={(value: any) => setCreateForm({...createForm, successMetric: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                      <SelectItem value="completion_time">Completion Time</SelectItem>
                      <SelectItem value="lead_quality">Lead Quality Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="confidence-level">Confidence Level</Label>
                  <Select value={createForm.confidenceLevel.toString()} onValueChange={(value) => setCreateForm({...createForm, confidenceLevel: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Traffic Split: {createForm.trafficSplit}% to variant</Label>
                  <Slider
                    value={[createForm.trafficSplit]}
                    onValueChange={([value]) => setCreateForm({...createForm, trafficSplit: value})}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Control: {100 - createForm.trafficSplit}%</span>
                    <span>Variant: {createForm.trafficSplit}%</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="min-sample">Minimum Sample Size</Label>
                  <Input
                    id="min-sample"
                    type="number"
                    value={createForm.minSampleSize}
                    onChange={(e) => setCreateForm({...createForm, minSampleSize: parseInt(e.target.value) || 100})}
                    min={50}
                    max={10000}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTest}>
                  Create Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test List and Results */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">A/B Testing Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're building advanced A/B testing capabilities with statistical significance calculation,
              winner promotion, and comprehensive analytics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-medium mb-2">Statistical Analysis</h4>
                <p className="text-sm text-gray-600">
                  Confidence intervals, p-values, and automated significance detection
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-medium mb-2">Winner Promotion</h4>
                <p className="text-sm text-gray-600">
                  Automatically promote winning variants to your main flow
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Zap className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-medium mb-2">Smart Traffic Splitting</h4>
                <p className="text-sm text-gray-600">
                  Dynamic traffic allocation based on early performance indicators
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
