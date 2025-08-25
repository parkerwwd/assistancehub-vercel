import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import {
  Brain, Zap, TrendingUp, Target, Lightbulb, CheckCircle, AlertTriangle,
  Users, Clock, Star, ArrowRight, Sparkles, BarChart3, Settings,
  Bot, Cpu, Award, Rocket
} from 'lucide-react';
import { 
  AIOptimizationService, 
  AIOptimizationAnalysis, 
  OptimizationSuggestion,
  SmartFormSuggestion,
  LeadScore,
  LeadScoringModel
} from '@/services/aiOptimizationService';
import { toast } from '@/hooks/use-toast';

interface AIOptimizationDashboardProps {
  flowId?: string;
  className?: string;
}

export default function AIOptimizationDashboard({ flowId, className }: AIOptimizationDashboardProps) {
  const [analysis, setAnalysis] = useState<AIOptimizationAnalysis | null>(null);
  const [formSuggestions, setFormSuggestions] = useState<SmartFormSuggestion[]>([]);
  const [scoringModel, setScoringModel] = useState<LeadScoringModel | null>(null);
  const [recommendations, setRecommendations] = useState<{
    quickWins: OptimizationSuggestion[];
    strategicChanges: OptimizationSuggestion[];
    experimentIdeas: OptimizationSuggestion[];
  }>({ quickWins: [], strategicChanges: [], experimentIdeas: [] });
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [trainingModel, setTrainingModel] = useState(false);

  const loadData = async () => {
    if (!flowId) return;
    
    setLoading(true);
    try {
      const [
        analysisResult,
        suggestionsData,
        recommendationsData
      ] = await Promise.all([
        AIOptimizationService.analyzeFlow(flowId),
        AIOptimizationService.getFormSuggestions(flowId),
        AIOptimizationService.getAutomatedRecommendations(flowId)
      ]);

      if (analysisResult.success && analysisResult.analysis) {
        setAnalysis(analysisResult.analysis);
      }
      
      setFormSuggestions(suggestionsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load AI optimization data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI optimization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [flowId]);

  const handleAnalyzeFlow = async () => {
    if (!flowId) return;
    
    setAnalyzing(true);
    try {
      const result = await AIOptimizationService.analyzeFlow(flowId);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        toast({
          title: "Analysis Complete",
          description: "AI analysis has been updated with latest data"
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: result.errors?.join(', ') || "Failed to analyze flow",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to analyze flow:', error);
      toast({
        title: "Error",
        description: "Failed to analyze flow",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrainModel = async () => {
    if (!flowId) return;
    
    setTrainingModel(true);
    try {
      const result = await AIOptimizationService.trainLeadScoringModel(flowId);
      if (result.success) {
        toast({
          title: "Model Training Complete",
          description: "Lead scoring model has been trained and activated"
        });
        loadData(); // Reload to get updated model info
      } else {
        toast({
          title: "Training Failed",
          description: result.errors?.join(', ') || "Failed to train model",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to train model:', error);
      toast({
        title: "Error",
        description: "Failed to train lead scoring model",
        variant: "destructive"
      });
    } finally {
      setTrainingModel(false);
    }
  };

  const getPriorityColor = (priority: OptimizationSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatConfidence = (confidence: number) => `${confidence}%`;
  const formatImpact = (impact: number) => `+${impact}%`;

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading AI optimization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            AI Optimization Suite
          </h1>
          <p className="text-gray-600 mt-1">Intelligent insights and automated optimization recommendations</p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleAnalyzeFlow} 
            disabled={analyzing || !flowId}
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 mr-2" />
                Analyze Flow
              </>
            )}
          </Button>
          <Button 
            onClick={handleTrainModel} 
            disabled={trainingModel || !flowId}
          >
            {trainingModel ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Training...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Train AI Model
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis?.confidence || 0}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Optimization Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis ? Math.round(analysis.analysis.performanceMetrics.benchmarkComparison.percentile) : 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suggestions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.quickWins.length + recommendations.strategicChanges.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Lift</p>
                <p className="text-2xl font-bold text-green-600">
                  +{recommendations.quickWins.reduce((sum, rec) => sum + rec.expectedImpact.conversionLift, 0)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Rocket className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!analysis && !flowId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Flow Optimization</h3>
            <p className="text-gray-600 text-center mb-6 max-w-2xl">
              Leverage machine learning to automatically optimize your lead capture flows. 
              Get intelligent suggestions for improving conversion rates, lead quality, and user experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Conversion Optimization</h4>
                <p className="text-sm text-gray-600">
                  Identify bottlenecks and get AI-powered suggestions to boost conversion rates
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Lead Scoring</h4>
                <p className="text-sm text-gray-600">
                  Automatically score leads based on their likelihood to convert
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Smart Personalization</h4>
                <p className="text-sm text-gray-600">
                  Dynamically adapt forms based on user behavior and characteristics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions">Quick Wins</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Key metrics and benchmark comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{analysis.analysis.performanceMetrics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analysis.analysis.performanceMetrics.conversionRate} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Completion Time</span>
                      <span className="font-semibold">{Math.round(analysis.analysis.performanceMetrics.averageCompletionTime / 60)}m</span>
                    </div>
                    <Progress value={(analysis.analysis.performanceMetrics.averageCompletionTime / 600) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <span className="font-semibold">{analysis.analysis.performanceMetrics.userSatisfactionScore}/5</span>
                    </div>
                    <Progress value={(analysis.analysis.performanceMetrics.userSatisfactionScore / 5) * 100} className="h-2" />
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Industry Benchmark</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Your Performance</span>
                        <div className="font-semibold">{analysis.analysis.performanceMetrics.benchmarkComparison.yourPerformance.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Industry Average</span>
                        <div className="font-semibold">{analysis.analysis.performanceMetrics.benchmarkComparison.industryAverage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        You're in the {analysis.analysis.performanceMetrics.benchmarkComparison.percentile}th percentile
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Quality Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Quality Distribution</CardTitle>
                  <CardDescription>AI-powered lead quality analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {analysis.analysis.leadQualityInsights.averageScore}
                      </div>
                      <div className="text-sm text-gray-600">Average Lead Score</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Quality (80-100)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${analysis.analysis.leadQualityInsights.scoreDistribution.high}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12">
                            {analysis.analysis.leadQualityInsights.scoreDistribution.high}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Medium Quality (50-79)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${analysis.analysis.leadQualityInsights.scoreDistribution.medium}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12">
                            {analysis.analysis.leadQualityInsights.scoreDistribution.medium}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Low Quality (0-49)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${analysis.analysis.leadQualityInsights.scoreDistribution.low}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12">
                            {analysis.analysis.leadQualityInsights.scoreDistribution.low}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Wins Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid gap-6">
              {/* Quick Wins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Quick Wins - High Impact, Low Effort
                  </CardTitle>
                  <CardDescription>
                    Implement these changes for immediate conversion improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.quickWins.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                      <p>Great job! No quick wins available - your flow is well optimized.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.quickWins.map((suggestion, index) => (
                        <div key={suggestion.id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-green-600">
                                {formatImpact(suggestion.expectedImpact.conversionLift)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatConfidence(suggestion.expectedImpact.confidence)} confidence
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Effort: {suggestion.expectedImpact.effort}</span>
                              <span>Based on {suggestion.basedOn.dataPoints} data points</span>
                            </div>
                            <Button size="sm">
                              Implement
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strategic Changes */}
              {recommendations.strategicChanges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Strategic Changes
                    </CardTitle>
                    <CardDescription>
                      Larger changes that require more effort but offer significant returns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.strategicChanges.map((suggestion, index) => (
                        <div key={suggestion.id || index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-blue-600">
                                {formatImpact(suggestion.expectedImpact.conversionLift)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatConfidence(suggestion.expectedImpact.confidence)} confidence
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Effort: {suggestion.expectedImpact.effort}</span>
                              <span>Test plan included</span>
                            </div>
                            <Button size="sm" variant="outline">
                              Plan Implementation
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Bottlenecks Tab */}
          <TabsContent value="bottlenecks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Bottlenecks Analysis</CardTitle>
                <CardDescription>AI-identified areas where users drop off most frequently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.analysis.conversionBottlenecks
                    .filter(bottleneck => bottleneck.impactScore > 5)
                    .map((bottleneck, index) => (
                    <div key={bottleneck.stepId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{bottleneck.stepName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={bottleneck.impactScore > 7 ? "destructive" : "secondary"}>
                            Impact: {bottleneck.impactScore}/10
                          </Badge>
                          <span className="text-sm text-red-600 font-medium">
                            {bottleneck.dropOffRate.toFixed(1)}% drop-off
                          </span>
                        </div>
                      </div>
                      
                      {bottleneck.issues.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium mb-2">Identified Issues:</h5>
                          <div className="space-y-1">
                            {bottleneck.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                <span>{issue.description}</span>
                                <Badge variant="outline" className="text-xs">
                                  {issue.confidence}% confidence
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bottleneck.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">AI Recommendations:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {bottleneck.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Scoring Tab */}
          <TabsContent value="scoring" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Intelligent Lead Scoring</h3>
                <p className="text-gray-600 mb-6">
                  Train AI models to automatically score lead quality based on form responses and user behavior.
                  Get instant insights into which leads are most likely to convert.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Automatic Scoring</h4>
                    <p className="text-sm text-gray-600">
                      Real-time lead scoring based on machine learning models
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Quality Insights</h4>
                    <p className="text-sm text-gray-600">
                      Understand what factors contribute to high-quality leads
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Priority Routing</h4>
                    <p className="text-sm text-gray-600">
                      Automatically prioritize leads for your sales team
                    </p>
                  </div>
                </div>
                <Button onClick={handleTrainModel} disabled={trainingModel} size="lg">
                  {trainingModel ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Train Scoring Model
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Advanced analytics and predictive insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Advanced AI Insights Coming Soon</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    We're building advanced machine learning capabilities including predictive analytics,
                    user journey optimization, and automated personalization at scale.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      'Predictive Lead Scoring',
                      'Churn Prediction',
                      'Revenue Forecasting',
                      'Automated Personalization'
                    ].map((feature) => (
                      <Badge key={feature} variant="secondary" className="p-2">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
