import { supabase } from '@/integrations/supabase/client';
import { FlowPayload } from '@/types/flowSchema';

/**
 * Advanced Analytics Service for Enterprise-level insights
 * Provides conversion funnels, lead scoring, source analysis, and real-time metrics
 */

export interface AnalyticsMetrics {
  totalViews: number;
  totalCompletions: number;
  conversionRate: number;
  averageTimeToComplete: number;
  bounceRate: number;
  uniqueVisitors: number;
}

export interface FunnelStep {
  stepIndex: number;
  stepName: string;
  stepType: string;
  views: number;
  completions: number;
  dropOffRate: number;
  averageTime: number;
}

export interface SourcePerformance {
  source: string;
  medium?: string;
  campaign?: string;
  views: number;
  completions: number;
  conversionRate: number;
  leadQuality: number; // 0-100 score
  revenue?: number;
}

export interface LeadQualityMetrics {
  score: number;
  distribution: {
    high: number; // 80-100
    medium: number; // 50-79  
    low: number; // 0-49
  };
  trends: Array<{
    date: string;
    averageScore: number;
  }>;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  completions: number;
  conversionRate: number;
}

export const AnalyticsService = {
  /**
   * Get comprehensive flow analytics
   */
  async getFlowAnalytics(
    flowId: string, 
    dateRange: { start: Date; end: Date }
  ): Promise<{
    metrics: AnalyticsMetrics;
    funnel: FunnelStep[];
    sources: SourcePerformance[];
    timeSeries: TimeSeriesData[];
  }> {
    try {
      // Get flow structure for funnel analysis
      const { data: flow } = await supabase
        .from('flows')
        .select(`
          *,
          flow_versions!inner(payload)
        `)
        .eq('id', flowId)
        .eq('flow_versions.status', 'published')
        .order('flow_versions.version', { ascending: false })
        .limit(1)
        .single();

      if (!flow || !flow.flow_versions?.[0]?.payload) {
        throw new Error('Flow not found or not published');
      }

      const flowPayload = flow.flow_versions[0].payload as FlowPayload;

      // Get leads data for the date range
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('flow_id', flowId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Calculate overall metrics
      const totalViews = flow.total_views || 0;
      const totalCompletions = leads?.length || 0;
      const conversionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;
      
      // Calculate average time to complete
      const completedLeads = leads?.filter(l => l.time_to_complete) || [];
      const averageTimeToComplete = completedLeads.length > 0 
        ? completedLeads.reduce((sum, l) => sum + (l.time_to_complete || 0), 0) / completedLeads.length
        : 0;

      // Get unique visitors (simplified - in production, use proper session tracking)
      const uniqueVisitors = await this.calculateUniqueVisitors(flowId, dateRange);

      const metrics: AnalyticsMetrics = {
        totalViews,
        totalCompletions,
        conversionRate,
        averageTimeToComplete,
        bounceRate: totalViews > 0 ? ((totalViews - totalCompletions) / totalViews) * 100 : 0,
        uniqueVisitors
      };

      // Build conversion funnel
      const funnel = await this.buildConversionFunnel(flowPayload, leads || []);

      // Analyze source performance
      const sources = await this.analyzeSourcePerformance(leads || []);

      // Get time series data
      const timeSeries = await this.getTimeSeriesData(flowId, dateRange);

      return {
        metrics,
        funnel,
        sources,
        timeSeries
      };

    } catch (error) {
      console.error('Failed to get flow analytics:', error);
      throw error;
    }
  },

  /**
   * Build conversion funnel analysis
   */
  async buildConversionFunnel(flow: FlowPayload, leads: any[]): Promise<FunnelStep[]> {
    const funnel: FunnelStep[] = [];
    
    // For now, use simplified funnel based on completed leads
    // In production, you'd track step-by-step analytics
    flow.steps.forEach((step, index) => {
      const stepCompletions = leads.filter(l => {
        // Simplified: assume all completed leads went through all steps
        return l.completed_at;
      }).length;

      funnel.push({
        stepIndex: index,
        stepName: step.title || `Step ${index + 1}`,
        stepType: step.step_type,
        views: index === 0 ? leads.length : stepCompletions, // Simplified
        completions: stepCompletions,
        dropOffRate: index === 0 ? 0 : ((leads.length - stepCompletions) / leads.length) * 100,
        averageTime: 30 // Simplified - would track actual time per step
      });
    });

    return funnel;
  },

  /**
   * Analyze traffic source performance
   */
  async analyzeSourcePerformance(leads: any[]): Promise<SourcePerformance[]> {
    const sourceMap = new Map<string, {
      views: number;
      completions: number;
      totalScore: number;
      count: number;
    }>();

    leads.forEach(lead => {
      const source = lead.utm_source || 'direct';
      const medium = lead.utm_medium;
      const campaign = lead.utm_campaign;
      
      const key = `${source}|${medium || ''}|${campaign || ''}`;
      
      if (!sourceMap.has(key)) {
        sourceMap.set(key, { views: 0, completions: 0, totalScore: 0, count: 0 });
      }
      
      const data = sourceMap.get(key)!;
      data.views += 1; // Simplified
      data.completions += lead.completed_at ? 1 : 0;
      data.totalScore += lead.score || 50; // Default score
      data.count += 1;
    });

    return Array.from(sourceMap.entries()).map(([key, data]) => {
      const [source, medium, campaign] = key.split('|');
      return {
        source,
        medium: medium || undefined,
        campaign: campaign || undefined,
        views: data.views,
        completions: data.completions,
        conversionRate: data.views > 0 ? (data.completions / data.views) * 100 : 0,
        leadQuality: data.count > 0 ? data.totalScore / data.count : 50
      };
    }).sort((a, b) => b.completions - a.completions);
  },

  /**
   * Get time series analytics data
   */
  async getTimeSeriesData(flowId: string, dateRange: { start: Date; end: Date }): Promise<TimeSeriesData[]> {
    try {
      // Generate date range
      const dates: string[] = [];
      const currentDate = new Date(dateRange.start);
      
      while (currentDate <= dateRange.end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Get daily completions
      const { data: dailyCompletions } = await supabase
        .from('leads')
        .select('created_at, completed_at')
        .eq('flow_id', flowId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Group by date
      const dailyData = new Map<string, { views: number; completions: number }>();
      
      dates.forEach(date => {
        dailyData.set(date, { views: 0, completions: 0 });
      });

      dailyCompletions?.forEach(lead => {
        const date = lead.created_at.split('T')[0];
        const data = dailyData.get(date);
        if (data) {
          data.views += 1; // Simplified - in production, track actual views
          data.completions += lead.completed_at ? 1 : 0;
        }
      });

      return Array.from(dailyData.entries()).map(([date, data]) => ({
        date,
        views: data.views,
        completions: data.completions,
        conversionRate: data.views > 0 ? (data.completions / data.views) * 100 : 0
      }));

    } catch (error) {
      console.error('Failed to get time series data:', error);
      return [];
    }
  },

  /**
   * Calculate unique visitors (simplified implementation)
   */
  async calculateUniqueVisitors(flowId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      // Simplified: count unique IP addresses
      const { data: leads } = await supabase
        .from('leads')
        .select('ip_address')
        .eq('flow_id', flowId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      const uniqueIPs = new Set(
        leads?.map(l => l.ip_address).filter(Boolean) || []
      );

      return uniqueIPs.size;
    } catch (error) {
      console.error('Failed to calculate unique visitors:', error);
      return 0;
    }
  },

  /**
   * Get lead quality distribution and trends
   */
  async getLeadQualityMetrics(
    flowId?: string, 
    dateRange: { start: Date; end: Date } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  ): Promise<LeadQualityMetrics> {
    try {
      let query = supabase
        .from('leads')
        .select('score, created_at')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (flowId) {
        query = query.eq('flow_id', flowId);
      }

      const { data: leads } = await query;

      if (!leads || leads.length === 0) {
        return {
          score: 0,
          distribution: { high: 0, medium: 0, low: 0 },
          trends: []
        };
      }

      // Calculate average score
      const scores = leads.map(l => l.score || 50);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      // Calculate distribution
      const high = scores.filter(s => s >= 80).length;
      const medium = scores.filter(s => s >= 50 && s < 80).length;
      const low = scores.filter(s => s < 50).length;
      const total = scores.length;

      const distribution = {
        high: total > 0 ? (high / total) * 100 : 0,
        medium: total > 0 ? (medium / total) * 100 : 0,
        low: total > 0 ? (low / total) * 100 : 0
      };

      // Calculate daily trends (simplified)
      const trends: Array<{ date: string; averageScore: number }> = [];
      const dailyScores = new Map<string, number[]>();

      leads.forEach(lead => {
        const date = lead.created_at.split('T')[0];
        if (!dailyScores.has(date)) {
          dailyScores.set(date, []);
        }
        dailyScores.get(date)!.push(lead.score || 50);
      });

      dailyScores.forEach((scores, date) => {
        const dayAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        trends.push({ date, averageScore: dayAverage });
      });

      trends.sort((a, b) => a.date.localeCompare(b.date));

      return {
        score: Math.round(averageScore),
        distribution,
        trends
      };

    } catch (error) {
      console.error('Failed to get lead quality metrics:', error);
      return {
        score: 0,
        distribution: { high: 0, medium: 0, low: 0 },
        trends: []
      };
    }
  },

  /**
   * Get real-time metrics (last 24 hours)
   */
  async getRealTimeMetrics(flowId?: string) {
    const last24Hours = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    };

    try {
      let query = supabase
        .from('leads')
        .select('*')
        .gte('created_at', last24Hours.start.toISOString());

      if (flowId) {
        query = query.eq('flow_id', flowId);
      }

      const { data: leads } = await query;
      
      const completions = leads?.filter(l => l.completed_at).length || 0;
      const totalViews = leads?.length || 0;

      return {
        views: totalViews,
        completions,
        conversionRate: totalViews > 0 ? (completions / totalViews) * 100 : 0,
        lastHour: {
          views: leads?.filter(l => 
            new Date(l.created_at) > new Date(Date.now() - 60 * 60 * 1000)
          ).length || 0
        }
      };
    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      return {
        views: 0,
        completions: 0,
        conversionRate: 0,
        lastHour: { views: 0 }
      };
    }
  }
};
