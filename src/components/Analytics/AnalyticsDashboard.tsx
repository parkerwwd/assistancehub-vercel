import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, FunnelChart, Funnel, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, Target, Clock,
  RefreshCw, Calendar, Download, Share2, AlertCircle
} from 'lucide-react';
import { AnalyticsService, AnalyticsMetrics, FunnelStep, SourcePerformance, TimeSeriesData } from '@/services/analyticsService';

interface AnalyticsDashboardProps {
  flowId?: string;
  className?: string;
}

export default function AnalyticsDashboard({ flowId, className }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [sources, setSources] = useState<SourcePerformance[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Date range options
  const dateRangeOptions = {
    '1d': { label: 'Last 24 hours', days: 1 },
    '7d': { label: 'Last 7 days', days: 7 },
    '30d': { label: 'Last 30 days', days: 30 },
    '90d': { label: 'Last 90 days', days: 90 }
  };

  const getDateRange = (range: string) => {
    const days = dateRangeOptions[range as keyof typeof dateRangeOptions]?.days || 7;
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return { start, end };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const range = getDateRange(dateRange);
      
      if (flowId) {
        const analytics = await AnalyticsService.getFlowAnalytics(flowId, range);
        setMetrics(analytics.metrics);
        setFunnel(analytics.funnel);
        setSources(analytics.sources);
        setTimeSeries(analytics.timeSeries);
      }

      // Load real-time metrics
      const realTime = await AnalyticsService.getRealTimeMetrics(flowId);
      setRealTimeMetrics(realTime);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [flowId, dateRange]);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(async () => {
        const realTime = await AnalyticsService.getRealTimeMetrics(flowId);
        setRealTimeMetrics(realTime);
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, flowId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercent = (num: number) => `${num.toFixed(1)}%`;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Chart colors
  const colors = {
    primary: '#3B82F6',
    success: '#10B981', 
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899'
  };

  const pieColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.purple];

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {flowId ? 'Flow performance insights' : 'Overall system analytics'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateRangeOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Banner */}
      {realTimeMetrics && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-blue-900">Live (Last 24h)</span>
                <div className="flex items-center gap-4 text-sm">
                  <span><strong>{formatNumber(realTimeMetrics.views)}</strong> views</span>
                  <span><strong>{formatNumber(realTimeMetrics.completions)}</strong> completions</span>
                  <span><strong>{formatPercent(realTimeMetrics.conversionRate)}</strong> conversion</span>
                </div>
              </div>
              <Badge variant="secondary">
                {realTimeMetrics.lastHour.views} views in last hour
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalViews)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.5%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
                <Target className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalCompletions)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{formatPercent(metrics.conversionRate)}</span>
                <span className="text-gray-500 ml-1">conversion rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.uniqueVisitors)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-gray-600">
                  {formatPercent((metrics.uniqueVisitors / metrics.totalViews) * 100)} of total views
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Time</CardTitle>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatDuration(metrics.averageTimeToComplete)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-gray-600">
                  {formatPercent(metrics.bounceRate)} bounce rate
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Trend</CardTitle>
                <CardDescription>Daily conversion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [formatPercent(value), 'Conversion Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke={colors.primary} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
                <CardDescription>Performance by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sources.slice(0, 5).map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        {source.campaign && (
                          <div className="text-sm text-gray-500">{source.campaign}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(source.completions)}</div>
                        <div className="text-sm text-gray-500">
                          {formatPercent(source.conversionRate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Step-by-step user flow analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{step.stepName}</h3>
                          <Badge variant="secondary">{step.stepType}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Views</span>
                            <div className="font-semibold">{formatNumber(step.views)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Completions</span>
                            <div className="font-semibold">{formatNumber(step.completions)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Drop-off Rate</span>
                            <div className="font-semibold text-red-600">
                              {formatPercent(step.dropOffRate)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg. Time</span>
                            <div className="font-semibold">{formatDuration(step.averageTime)}</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step.completions / step.views) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Drop-off indicator */}
                    {index < funnel.length - 1 && step.dropOffRate > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formatPercent(step.dropOffRate)} drop-off
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Detailed breakdown by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Source</th>
                        <th className="text-right p-2">Views</th>
                        <th className="text-right p-2">Conversions</th>
                        <th className="text-right p-2">Rate</th>
                        <th className="text-right p-2">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div className="font-medium">{source.source}</div>
                            {source.medium && (
                              <div className="text-gray-500 text-xs">{source.medium}</div>
                            )}
                          </td>
                          <td className="text-right p-2">{formatNumber(source.views)}</td>
                          <td className="text-right p-2">{formatNumber(source.completions)}</td>
                          <td className="text-right p-2">{formatPercent(source.conversionRate)}</td>
                          <td className="text-right p-2">
                            <Badge 
                              variant={source.leadQuality >= 70 ? 'default' : 
                                     source.leadQuality >= 50 ? 'secondary' : 'destructive'}
                            >
                              {Math.round(source.leadQuality)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Source Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Distribution</CardTitle>
                <CardDescription>Breakdown of traffic sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sources.slice(0, 5)}
                      dataKey="completions"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {sources.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic & Conversion Trends</CardTitle>
              <CardDescription>Views and conversions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                    name="Views"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="completions"
                    stackId="1"
                    stroke={colors.success}
                    fill={colors.success}
                    fillOpacity={0.5}
                    name="Completions"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversionRate"
                    stroke={colors.warning}
                    strokeWidth={3}
                    name="Conversion Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
