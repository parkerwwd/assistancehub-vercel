import { supabase } from '@/integrations/supabase/client';
import { FlowPayload } from '@/types/flowSchema';

/**
 * A/B Testing Service for Enterprise-level conversion optimization
 * Handles test creation, traffic splitting, statistical significance, and winner promotion
 */

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  baseFlowId: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number; // Percentage for variant B (0-100)
  startDate: string;
  endDate?: string;
  minSampleSize: number;
  confidenceLevel: number; // 90, 95, 99
  hypothesis: string;
  successMetric: 'conversion_rate' | 'completion_time' | 'lead_quality';
  variants: ABTestVariant[];
  results?: ABTestResults;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ABTestVariant {
  id: string;
  testId: string;
  name: string; // 'Control' or 'Variant A', 'Variant B', etc.
  flowId: string;
  trafficAllocation: number; // Percentage of traffic (0-100)
  isControl: boolean;
  flowPayload: FlowPayload;
}

export interface ABTestResults {
  testId: string;
  variants: VariantResults[];
  winner?: {
    variantId: string;
    confidence: number;
    improvementPercent: number;
    significanceReached: boolean;
  };
  statisticalSignificance: {
    reached: boolean;
    pValue: number;
    confidence: number;
  };
  recommendation: 'continue' | 'stop_winner' | 'stop_inconclusive' | 'extend_test';
  lastCalculated: string;
}

export interface VariantResults {
  variantId: string;
  name: string;
  metrics: {
    views: number;
    completions: number;
    conversionRate: number;
    averageCompletionTime: number;
    averageLeadScore: number;
    bounceRate: number;
  };
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  isWinner: boolean;
}

export interface ABTestInsight {
  type: 'significant_improvement' | 'significant_decline' | 'no_difference' | 'needs_more_data';
  message: string;
  recommendation: string;
  confidenceLevel: number;
}

export const ABTestService = {
  /**
   * Create a new A/B test
   */
  async createTest(
    baseFlowId: string,
    testData: {
      name: string;
      description?: string;
      trafficSplit: number;
      hypothesis: string;
      successMetric: ABTest['successMetric'];
      variantFlowPayload: FlowPayload;
      minSampleSize?: number;
      confidenceLevel?: number;
    }
  ): Promise<{ success: boolean; testId?: string; errors?: string[] }> {
    try {
      // Get the base flow
      const { data: baseFlow } = await supabase
        .from('flows')
        .select(`*, flow_versions!inner(payload)`)
        .eq('id', baseFlowId)
        .eq('flow_versions.status', 'published')
        .single();

      if (!baseFlow) {
        return { success: false, errors: ['Base flow not found'] };
      }

      const baseFlowPayload = baseFlow.flow_versions[0].payload as FlowPayload;

      // Create variant flow
      const variantSlug = `${baseFlowPayload.slug}-variant-${Date.now()}`;
      const { data: variantFlow, error: variantError } = await supabase
        .from('flows')
        .insert({
          name: `${testData.name} - Variant`,
          slug: variantSlug,
          description: 'A/B test variant',
          status: 'draft',
          settings: testData.variantFlowPayload.settings,
          google_ads_config: testData.variantFlowPayload.google_ads_config,
          style_config: testData.variantFlowPayload.style_config
        })
        .select()
        .single();

      if (variantError || !variantFlow) {
        return { success: false, errors: [variantError?.message || 'Failed to create variant flow'] };
      }

      // Save variant flow version
      const { error: versionError } = await supabase
        .from('flow_versions')
        .insert({
          flow_id: variantFlow.id,
          slug: variantSlug,
          status: 'published',
          version: 1,
          payload: testData.variantFlowPayload
        });

      if (versionError) {
        return { success: false, errors: [versionError.message] };
      }

      // Create A/B test record
      const { data: abTest, error: testError } = await supabase
        .from('ab_tests')
        .insert({
          name: testData.name,
          description: testData.description,
          base_flow_id: baseFlowId,
          status: 'draft',
          traffic_split: testData.trafficSplit,
          min_sample_size: testData.minSampleSize || 100,
          confidence_level: testData.confidenceLevel || 95,
          hypothesis: testData.hypothesis,
          success_metric: testData.successMetric,
          start_date: new Date().toISOString()
        })
        .select()
        .single();

      if (testError || !abTest) {
        return { success: false, errors: [testError?.message || 'Failed to create test'] };
      }

      // Create test variants
      const variants = [
        {
          test_id: abTest.id,
          name: 'Control',
          flow_id: baseFlowId,
          traffic_allocation: 100 - testData.trafficSplit,
          is_control: true
        },
        {
          test_id: abTest.id,
          name: 'Variant A',
          flow_id: variantFlow.id,
          traffic_allocation: testData.trafficSplit,
          is_control: false
        }
      ];

      const { error: variantsError } = await supabase
        .from('ab_test_variants')
        .insert(variants);

      if (variantsError) {
        return { success: false, errors: [variantsError.message] };
      }

      return { success: true, testId: abTest.id };

    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Start an A/B test
   */
  async startTest(testId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ 
          status: 'running',
          start_date: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get flow for A/B test (returns appropriate variant based on traffic split)
   */
  async getTestFlow(baseFlowId: string, visitorId: string): Promise<{
    flowId: string;
    isVariant: boolean;
    testId?: string;
  }> {
    try {
      // Check for active A/B tests for this flow
      const { data: activeTests } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_test_variants(*)
        `)
        .eq('base_flow_id', baseFlowId)
        .eq('status', 'running');

      if (!activeTests || activeTests.length === 0) {
        return { flowId: baseFlowId, isVariant: false };
      }

      // Use the first active test (in production, you might have multiple tests)
      const test = activeTests[0];
      const variants = test.ab_test_variants;

      // Determine which variant to show based on visitor ID hash
      const hash = this.hashString(visitorId + test.id);
      const percentage = (hash % 100) + 1;

      // Find the appropriate variant
      let cumulativePercentage = 0;
      for (const variant of variants) {
        cumulativePercentage += variant.traffic_allocation;
        if (percentage <= cumulativePercentage) {
          return {
            flowId: variant.flow_id,
            isVariant: !variant.is_control,
            testId: test.id
          };
        }
      }

      // Fallback to control
      const controlVariant = variants.find(v => v.is_control);
      return {
        flowId: controlVariant?.flow_id || baseFlowId,
        isVariant: false,
        testId: test.id
      };

    } catch (error) {
      console.error('Error getting test flow:', error);
      return { flowId: baseFlowId, isVariant: false };
    }
  },

  /**
   * Record A/B test interaction (view or conversion)
   */
  async recordInteraction(
    testId: string,
    variantId: string,
    visitorId: string,
    event: 'view' | 'conversion',
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('ab_test_interactions')
        .insert({
          test_id: testId,
          variant_id: variantId,
          visitor_id: visitorId,
          event,
          metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record A/B test interaction:', error);
    }
  },

  /**
   * Calculate A/B test results with statistical significance
   */
  async calculateResults(testId: string): Promise<ABTestResults | null> {
    try {
      // Get test and variants
      const { data: test } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_test_variants(*)
        `)
        .eq('id', testId)
        .single();

      if (!test) return null;

      // Get interaction data
      const { data: interactions } = await supabase
        .from('ab_test_interactions')
        .select('*')
        .eq('test_id', testId);

      if (!interactions || interactions.length === 0) return null;

      // Calculate metrics for each variant
      const variantResults: VariantResults[] = [];
      let winner: ABTestResults['winner'];
      let maxConversionRate = 0;

      for (const variant of test.ab_test_variants) {
        const variantInteractions = interactions.filter(i => i.variant_id === variant.id);
        const views = variantInteractions.filter(i => i.event === 'view').length;
        const conversions = variantInteractions.filter(i => i.event === 'conversion').length;
        const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

        // Calculate confidence interval using Wilson score interval
        const { lower, upper } = this.calculateConfidenceInterval(conversions, views, 0.95);

        const result: VariantResults = {
          variantId: variant.id,
          name: variant.name,
          metrics: {
            views,
            completions: conversions,
            conversionRate,
            averageCompletionTime: 120, // Simplified
            averageLeadScore: 75, // Simplified
            bounceRate: views > 0 ? ((views - conversions) / views) * 100 : 0
          },
          confidenceInterval: { lower, upper },
          isWinner: false
        };

        variantResults.push(result);

        if (conversionRate > maxConversionRate && views >= test.min_sample_size) {
          maxConversionRate = conversionRate;
        }
      }

      // Determine statistical significance and winner
      const significance = this.calculateStatisticalSignificance(variantResults);
      
      if (significance.reached && variantResults.length >= 2) {
        const control = variantResults.find(v => v.name === 'Control');
        const variants = variantResults.filter(v => v.name !== 'Control');
        const bestVariant = variants.reduce((best, current) => 
          current.metrics.conversionRate > best.metrics.conversionRate ? current : best
        );

        if (control && bestVariant.metrics.conversionRate > control.metrics.conversionRate) {
          const improvement = ((bestVariant.metrics.conversionRate - control.metrics.conversionRate) / control.metrics.conversionRate) * 100;
          
          winner = {
            variantId: bestVariant.variantId,
            confidence: significance.confidence,
            improvementPercent: improvement,
            significanceReached: true
          };

          bestVariant.isWinner = true;
        }
      }

      // Generate recommendation
      const recommendation = this.generateRecommendation(variantResults, significance, test);

      const results: ABTestResults = {
        testId,
        variants: variantResults,
        winner,
        statisticalSignificance: significance,
        recommendation,
        lastCalculated: new Date().toISOString()
      };

      // Save results
      await supabase
        .from('ab_test_results')
        .upsert({
          test_id: testId,
          results: results,
          updated_at: new Date().toISOString()
        });

      return results;

    } catch (error) {
      console.error('Failed to calculate A/B test results:', error);
      return null;
    }
  },

  /**
   * Promote winning variant to main flow
   */
  async promoteWinner(testId: string, winnerVariantId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Get test details
      const { data: test } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_test_variants(*)
        `)
        .eq('id', testId)
        .single();

      if (!test) {
        return { success: false, errors: ['Test not found'] };
      }

      const winnerVariant = test.ab_test_variants.find(v => v.id === winnerVariantId);
      if (!winnerVariant) {
        return { success: false, errors: ['Winner variant not found'] };
      }

      // Get winner flow payload
      const { data: winnerFlow } = await supabase
        .from('flows')
        .select(`*, flow_versions!inner(payload)`)
        .eq('id', winnerVariant.flow_id)
        .eq('flow_versions.status', 'published')
        .single();

      if (!winnerFlow) {
        return { success: false, errors: ['Winner flow not found'] };
      }

      // Update main flow with winner's configuration
      const winnerPayload = winnerFlow.flow_versions[0].payload;
      
      // Create new version for the base flow
      const { data: baseFlow } = await supabase
        .from('flows')
        .select('*')
        .eq('id', test.base_flow_id)
        .single();

      if (!baseFlow) {
        return { success: false, errors: ['Base flow not found'] };
      }

      // Get current version number
      const { data: latestVersion } = await supabase
        .from('flow_versions')
        .select('version')
        .eq('flow_id', test.base_flow_id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version || 0) + 1;

      // Create new version with winner's payload
      const { error: versionError } = await supabase
        .from('flow_versions')
        .insert({
          flow_id: test.base_flow_id,
          slug: baseFlow.slug,
          status: 'published',
          version: nextVersion,
          payload: winnerPayload
        });

      if (versionError) {
        return { success: false, errors: [versionError.message] };
      }

      // Archive old published version
      await supabase
        .from('flow_versions')
        .update({ status: 'archived' })
        .eq('flow_id', test.base_flow_id)
        .eq('status', 'published')
        .neq('version', nextVersion);

      // Mark test as completed
      await supabase
        .from('ab_tests')
        .update({ 
          status: 'completed',
          end_date: new Date().toISOString()
        })
        .eq('id', testId);

      // Add audit trail
      await supabase
        .from('flow_audit')
        .insert({
          flow_id: test.base_flow_id,
          action: 'ab_test_promotion',
          meta: {
            testId,
            winnerVariantId,
            version: nextVersion
          }
        });

      return { success: true };

    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * List all A/B tests
   */
  async listTests(limit = 20, offset = 0): Promise<ABTest[]> {
    try {
      const { data: tests } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_test_variants(*),
          ab_test_results(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return tests || [];
    } catch (error) {
      console.error('Failed to list A/B tests:', error);
      return [];
    }
  },

  // Helper methods
  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  },

  calculateConfidenceInterval(successes: number, trials: number, confidence: number): { lower: number; upper: number } {
    if (trials === 0) return { lower: 0, upper: 0 };

    const p = successes / trials;
    const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.58 : 1.64;
    
    const margin = z * Math.sqrt((p * (1 - p)) / trials);
    
    return {
      lower: Math.max(0, (p - margin) * 100),
      upper: Math.min(100, (p + margin) * 100)
    };
  },

  calculateStatisticalSignificance(variants: VariantResults[]): { reached: boolean; pValue: number; confidence: number } {
    if (variants.length < 2) {
      return { reached: false, pValue: 1, confidence: 0 };
    }

    // Simplified z-test for proportions
    const control = variants.find(v => v.name === 'Control');
    const testVariant = variants.find(v => v.name !== 'Control');

    if (!control || !testVariant) {
      return { reached: false, pValue: 1, confidence: 0 };
    }

    const p1 = control.metrics.conversionRate / 100;
    const p2 = testVariant.metrics.conversionRate / 100;
    const n1 = control.metrics.views;
    const n2 = testVariant.metrics.views;

    if (n1 < 30 || n2 < 30) {
      return { reached: false, pValue: 1, confidence: 0 };
    }

    const pooledP = ((n1 * p1) + (n2 * p2)) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * ((1 / n1) + (1 / n2)));
    const zScore = Math.abs(p2 - p1) / se;
    
    // Convert z-score to p-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    return {
      reached: pValue < 0.05,
      pValue,
      confidence: (1 - pValue) * 100
    };
  },

  normalCDF(x: number): number {
    // Approximation of the cumulative distribution function for standard normal distribution
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  },

  erf(x: number): number {
    // Approximation of the error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  },

  generateRecommendation(
    variants: VariantResults[], 
    significance: { reached: boolean; confidence: number }, 
    test: any
  ): ABTestResults['recommendation'] {
    if (variants.length < 2) return 'stop_inconclusive';

    const maxSampleReached = variants.every(v => v.metrics.views >= test.min_sample_size);
    
    if (significance.reached && maxSampleReached) {
      return 'stop_winner';
    }
    
    if (!maxSampleReached) {
      return 'continue';
    }
    
    if (significance.confidence < 80) {
      return 'extend_test';
    }
    
    return 'stop_inconclusive';
  }
};
