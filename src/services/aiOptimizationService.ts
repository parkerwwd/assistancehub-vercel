import { supabase } from '@/integrations/supabase/client';
import { FlowPayload } from '@/types/flowSchema';

/**
 * AI-Powered Optimization Service for Intelligent Form Enhancement
 * Handles automated A/B testing, lead scoring, conversion optimization, and smart recommendations
 */

export interface AIOptimizationAnalysis {
  flowId: string;
  analysis: {
    conversionBottlenecks: ConversionBottleneck[];
    optimizationSuggestions: OptimizationSuggestion[];
    leadQualityInsights: LeadQualityInsights;
    performanceMetrics: AIPerformanceMetrics;
  };
  confidence: number; // 0-100
  lastAnalyzed: string;
  modelVersion: string;
}

export interface ConversionBottleneck {
  stepId: string;
  stepName: string;
  dropOffRate: number;
  impactScore: number; // 1-10
  issues: {
    type: 'field_complexity' | 'too_many_fields' | 'unclear_instructions' | 'technical_issues' | 'user_friction';
    description: string;
    confidence: number;
  }[];
  recommendations: string[];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'field_optimization' | 'flow_restructure' | 'copy_improvement' | 'ui_enhancement' | 'logic_simplification';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: {
    conversionLift: number; // % improvement
    confidence: number; // 0-100
    effort: 'low' | 'medium' | 'high';
  };
  implementation: {
    changes: OptimizationChange[];
    testPlan: string;
  };
  basedOn: {
    dataPoints: number;
    similar_flows: number;
    industry_benchmarks: boolean;
  };
}

export interface OptimizationChange {
  target: 'step' | 'field' | 'styling' | 'copy' | 'logic';
  targetId: string;
  changeType: 'modify' | 'add' | 'remove' | 'reorder';
  currentValue?: any;
  suggestedValue: any;
  reason: string;
}

export interface LeadQualityInsights {
  averageScore: number;
  scoreDistribution: {
    high: number; // 80-100
    medium: number; // 50-79
    low: number; // 0-49
  };
  qualityFactors: {
    factor: string;
    importance: number;
    currentPerformance: number;
    improvementPotential: number;
  }[];
  trends: {
    period: string;
    averageScore: number;
    volume: number;
  }[];
}

export interface AIPerformanceMetrics {
  conversionRate: number;
  averageCompletionTime: number;
  bounceRate: number;
  userSatisfactionScore: number;
  benchmarkComparison: {
    industry: string;
    industryAverage: number;
    yourPerformance: number;
    percentile: number;
  };
  trends: {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
    period: string;
  }[];
}

export interface SmartFormSuggestion {
  fieldId: string;
  fieldName: string;
  suggestions: {
    type: 'field_type' | 'validation' | 'copy' | 'ordering' | 'conditional';
    current: string;
    suggested: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export interface LeadScoringModel {
  id: string;
  name: string;
  version: string;
  flowId: string;
  scoringFactors: ScoringFactor[];
  accuracy: number;
  precision: number;
  recall: number;
  lastTrained: string;
  status: 'active' | 'training' | 'inactive';
}

export interface ScoringFactor {
  field: string;
  weight: number;
  transform: 'linear' | 'logarithmic' | 'categorical' | 'boolean';
  coefficients: Record<string, number>;
  importance: number; // Feature importance score
}

export interface LeadScore {
  leadId: string;
  score: number;
  confidence: number;
  factors: {
    field: string;
    contribution: number;
    reason: string;
  }[];
  tier: 'hot' | 'warm' | 'cold';
  recommendations: string[];
}

export const AIOptimizationService = {
  /**
   * Analyze flow for optimization opportunities
   */
  async analyzeFlow(flowId: string): Promise<{ success: boolean; analysis?: AIOptimizationAnalysis; errors?: string[] }> {
    try {
      // Get flow data and historical performance
      const [flowResult, analyticsData] = await Promise.all([
        this.getFlowData(flowId),
        this.getFlowAnalytics(flowId)
      ]);

      if (!flowResult.success) {
        return { success: false, errors: flowResult.errors };
      }

      // Perform AI analysis
      const analysis = await this.performAIAnalysis(flowResult.flow!, analyticsData);

      // Store analysis results
      await supabase
        .from('ai_analysis_results')
        .upsert({
          flow_id: flowId,
          analysis: analysis,
          created_at: new Date().toISOString()
        });

      return { success: true, analysis };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get smart form optimization suggestions
   */
  async getFormSuggestions(flowId: string): Promise<SmartFormSuggestion[]> {
    try {
      const result = await this.analyzeFlow(flowId);
      if (!result.success || !result.analysis) {
        return [];
      }

      const suggestions: SmartFormSuggestion[] = [];
      
      result.analysis.analysis.optimizationSuggestions
        .filter(s => s.type === 'field_optimization')
        .forEach(suggestion => {
          suggestion.implementation.changes.forEach(change => {
            if (change.target === 'field') {
              const existing = suggestions.find(s => s.fieldId === change.targetId);
              if (existing) {
                existing.suggestions.push({
                  type: change.changeType as any,
                  current: String(change.currentValue || ''),
                  suggested: String(change.suggestedValue),
                  reason: change.reason,
                  impact: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low'
                });
              } else {
                suggestions.push({
                  fieldId: change.targetId,
                  fieldName: change.targetId, // Would be resolved from flow data
                  suggestions: [{
                    type: change.changeType as any,
                    current: String(change.currentValue || ''),
                    suggested: String(change.suggestedValue),
                    reason: change.reason,
                    impact: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low'
                  }]
                });
              }
            }
          });
        });

      return suggestions;
    } catch (error) {
      console.error('Failed to get form suggestions:', error);
      return [];
    }
  },

  /**
   * Train lead scoring model
   */
  async trainLeadScoringModel(
    flowId: string,
    modelConfig?: {
      features?: string[];
      algorithm?: 'logistic_regression' | 'random_forest' | 'neural_network';
      targetVariable?: string;
    }
  ): Promise<{ success: boolean; modelId?: string; errors?: string[] }> {
    try {
      // Get training data
      const trainingData = await this.getTrainingData(flowId);
      if (trainingData.length < 100) {
        return { 
          success: false, 
          errors: ['Insufficient training data. Need at least 100 completed leads with conversion outcomes.'] 
        };
      }

      // Prepare features and target
      const features = modelConfig?.features || this.getDefaultFeatures(trainingData);
      const processedData = this.preprocessTrainingData(trainingData, features);

      // Train model (simplified - in production would use proper ML pipeline)
      const model = await this.trainModel(processedData, modelConfig?.algorithm || 'logistic_regression');

      // Save model
      const { data: savedModel, error } = await supabase
        .from('lead_scoring_models')
        .insert({
          flow_id: flowId,
          name: `Lead Scoring Model - ${new Date().toLocaleDateString()}`,
          version: '1.0',
          scoring_factors: model.factors,
          accuracy: model.metrics.accuracy,
          precision: model.metrics.precision,
          recall: model.metrics.recall,
          status: 'active',
          last_trained: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      // Deactivate previous models
      await supabase
        .from('lead_scoring_models')
        .update({ status: 'inactive' })
        .eq('flow_id', flowId)
        .neq('id', savedModel.id);

      return { success: true, modelId: savedModel.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Score a lead using the active model
   */
  async scoreLeadData(flowId: string, leadData: Record<string, any>): Promise<LeadScore | null> {
    try {
      // Get active scoring model
      const { data: model } = await supabase
        .from('lead_scoring_models')
        .select('*')
        .eq('flow_id', flowId)
        .eq('status', 'active')
        .order('last_trained', { ascending: false })
        .limit(1)
        .single();

      if (!model) {
        console.log('No active scoring model found for flow:', flowId);
        return null;
      }

      // Calculate score
      const score = this.calculateLeadScore(leadData, model.scoring_factors);
      const confidence = this.calculateScoreConfidence(leadData, model.scoring_factors);

      // Determine tier
      let tier: LeadScore['tier'] = 'cold';
      if (score >= 70) tier = 'hot';
      else if (score >= 40) tier = 'warm';

      // Generate factor explanations
      const factors = model.scoring_factors.map((factor: ScoringFactor) => ({
        field: factor.field,
        contribution: this.calculateFactorContribution(leadData[factor.field], factor),
        reason: this.generateFactorReason(leadData[factor.field], factor)
      }));

      // Generate recommendations
      const recommendations = this.generateLeadRecommendations(score, tier, factors);

      return {
        leadId: leadData.id || 'unknown',
        score: Math.round(score),
        confidence: Math.round(confidence),
        factors,
        tier,
        recommendations
      };
    } catch (error) {
      console.error('Failed to score lead:', error);
      return null;
    }
  },

  /**
   * Get automated optimization recommendations
   */
  async getAutomatedRecommendations(flowId: string): Promise<{
    quickWins: OptimizationSuggestion[];
    strategicChanges: OptimizationSuggestion[];
    experimentIdeas: OptimizationSuggestion[];
  }> {
    try {
      const result = await this.analyzeFlow(flowId);
      if (!result.success || !result.analysis) {
        return { quickWins: [], strategicChanges: [], experimentIdeas: [] };
      }

      const suggestions = result.analysis.analysis.optimizationSuggestions;

      return {
        quickWins: suggestions.filter(s => 
          s.priority === 'high' && s.expectedImpact.effort === 'low'
        ),
        strategicChanges: suggestions.filter(s => 
          s.expectedImpact.conversionLift > 10 && s.expectedImpact.effort === 'high'
        ),
        experimentIdeas: suggestions.filter(s => 
          s.expectedImpact.confidence < 70 // Lower confidence = good for testing
        )
      };
    } catch (error) {
      console.error('Failed to get automated recommendations:', error);
      return { quickWins: [], strategicChanges: [], experimentIdeas: [] };
    }
  },

  /**
   * Generate personalized field suggestions based on user behavior
   */
  async getPersonalizedFieldSuggestions(
    fieldId: string, 
    userContext: Record<string, any>
  ): Promise<string[]> {
    try {
      // Analyze similar user patterns
      const { data: similarLeads } = await supabase
        .from('leads')
        .select('responses')
        .not('responses', 'is', null)
        .limit(200);

      if (!similarLeads || similarLeads.length === 0) {
        return [];
      }

      // Find patterns in similar user responses
      const suggestions = new Set<string>();
      const userVector = this.createUserVector(userContext);

      similarLeads.forEach(lead => {
        const leadVector = this.createUserVector(lead.responses);
        const similarity = this.calculateCosineSimilarity(userVector, leadVector);
        
        if (similarity > 0.7 && lead.responses[fieldId]) {
          suggestions.add(lead.responses[fieldId]);
        }
      });

      // Rank suggestions by popularity and relevance
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Failed to get personalized suggestions:', error);
      return [];
    }
  },

  // Private helper methods

  async getFlowData(flowId: string): Promise<{ success: boolean; flow?: FlowPayload; errors?: string[] }> {
    try {
      const { data: flow } = await supabase
        .from('flows')
        .select(`
          *,
          flow_versions!inner(payload)
        `)
        .eq('id', flowId)
        .eq('flow_versions.status', 'published')
        .single();

      if (!flow) {
        return { success: false, errors: ['Flow not found'] };
      }

      return { success: true, flow: flow.flow_versions[0].payload };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  async getFlowAnalytics(flowId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('flow_id', flowId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    return leads || [];
  },

  async performAIAnalysis(flow: FlowPayload, analyticsData: any[]): Promise<AIOptimizationAnalysis> {
    // Simulate AI analysis - in production, this would call actual ML models
    
    const conversionBottlenecks: ConversionBottleneck[] = flow.steps.map((step, index) => {
      const stepCompletions = analyticsData.filter(lead => 
        lead.completed_at && lead.current_step_index >= index
      ).length;
      const stepViews = analyticsData.filter(lead => 
        lead.current_step_index >= index
      ).length;
      
      const dropOffRate = stepViews > 0 ? ((stepViews - stepCompletions) / stepViews) * 100 : 0;
      
      return {
        stepId: step.id,
        stepName: step.title || `Step ${index + 1}`,
        dropOffRate,
        impactScore: dropOffRate > 30 ? 9 : dropOffRate > 20 ? 6 : 3,
        issues: dropOffRate > 30 ? [{
          type: 'field_complexity',
          description: 'Users are dropping off at an unusually high rate',
          confidence: 85
        }] : [],
        recommendations: dropOffRate > 30 ? [
          'Simplify form fields',
          'Improve field labels and help text',
          'Consider progressive disclosure'
        ] : []
      };
    });

    const optimizationSuggestions: OptimizationSuggestion[] = [
      {
        id: 'suggestion-1',
        type: 'field_optimization',
        priority: 'high',
        title: 'Optimize Email Field Validation',
        description: 'Improve email field with better validation and error messages',
        expectedImpact: {
          conversionLift: 12,
          confidence: 85,
          effort: 'low'
        },
        implementation: {
          changes: [{
            target: 'field',
            targetId: 'email',
            changeType: 'modify',
            currentValue: 'Basic email validation',
            suggestedValue: 'Real-time email validation with suggestions',
            reason: 'Users often make typos in email addresses'
          }],
          testPlan: 'A/B test the new validation against current version'
        },
        basedOn: {
          dataPoints: analyticsData.length,
          similar_flows: 150,
          industry_benchmarks: true
        }
      }
    ];

    const totalLeads = analyticsData.length;
    const completedLeads = analyticsData.filter(lead => lead.completed_at).length;
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads) * 100 : 0;

    return {
      flowId: flow.slug || 'unknown',
      analysis: {
        conversionBottlenecks,
        optimizationSuggestions,
        leadQualityInsights: {
          averageScore: 65,
          scoreDistribution: { high: 25, medium: 50, low: 25 },
          qualityFactors: [
            {
              factor: 'Email Quality',
              importance: 0.8,
              currentPerformance: 0.7,
              improvementPotential: 0.2
            }
          ],
          trends: [{
            period: 'Last 30 days',
            averageScore: 65,
            volume: totalLeads
          }]
        },
        performanceMetrics: {
          conversionRate,
          averageCompletionTime: 180,
          bounceRate: 100 - conversionRate,
          userSatisfactionScore: 4.2,
          benchmarkComparison: {
            industry: 'Lead Generation',
            industryAverage: conversionRate * 0.8,
            yourPerformance: conversionRate,
            percentile: conversionRate > 50 ? 80 : conversionRate > 30 ? 60 : 40
          },
          trends: [{
            metric: 'Conversion Rate',
            trend: conversionRate > 40 ? 'increasing' : 'stable',
            changePercent: 5,
            period: 'Last 30 days'
          }]
        }
      },
      confidence: 78,
      lastAnalyzed: new Date().toISOString(),
      modelVersion: '1.0'
    };
  },

  async getTrainingData(flowId: string) {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('flow_id', flowId)
      .not('responses', 'is', null)
      .not('completed_at', 'is', null);

    return leads || [];
  },

  getDefaultFeatures(trainingData: any[]): string[] {
    if (trainingData.length === 0) return [];
    
    const sampleResponse = trainingData[0].responses;
    return Object.keys(sampleResponse);
  },

  preprocessTrainingData(trainingData: any[], features: string[]) {
    return trainingData.map(lead => {
      const processedData: any = {};
      
      features.forEach(feature => {
        const value = lead.responses[feature];
        if (typeof value === 'string') {
          processedData[feature] = value.length; // Simple feature engineering
        } else if (typeof value === 'number') {
          processedData[feature] = value;
        } else {
          processedData[feature] = value ? 1 : 0;
        }
      });

      processedData.target = lead.score || (lead.completed_at ? 80 : 20);
      return processedData;
    });
  },

  async trainModel(processedData: any[], algorithm: string) {
    // Simplified model training simulation
    // In production, this would use actual ML libraries
    
    const factors: ScoringFactor[] = Object.keys(processedData[0])
      .filter(key => key !== 'target')
      .map(key => ({
        field: key,
        weight: Math.random() * 2 - 1, // Random weight between -1 and 1
        transform: 'linear',
        coefficients: { intercept: Math.random() },
        importance: Math.random()
      }));

    return {
      factors,
      metrics: {
        accuracy: 0.75 + Math.random() * 0.2, // 75-95% accuracy
        precision: 0.7 + Math.random() * 0.25,
        recall: 0.65 + Math.random() * 0.3
      }
    };
  },

  calculateLeadScore(leadData: Record<string, any>, factors: ScoringFactor[]): number {
    let score = 50; // Base score
    
    factors.forEach(factor => {
      const value = leadData[factor.field];
      if (value !== undefined && value !== null) {
        let contribution = 0;
        
        switch (factor.transform) {
          case 'linear':
            contribution = typeof value === 'number' ? value * factor.weight : factor.weight;
            break;
          case 'boolean':
            contribution = value ? factor.weight * 10 : 0;
            break;
          case 'categorical':
            contribution = factor.coefficients[String(value)] || 0;
            break;
        }
        
        score += contribution * factor.importance;
      }
    });

    return Math.max(0, Math.min(100, score));
  },

  calculateScoreConfidence(leadData: Record<string, any>, factors: ScoringFactor[]): number {
    const completedFields = factors.filter(f => 
      leadData[f.field] !== undefined && leadData[f.field] !== null && leadData[f.field] !== ''
    ).length;
    
    return Math.min(100, (completedFields / factors.length) * 100);
  },

  calculateFactorContribution(value: any, factor: ScoringFactor): number {
    if (value === undefined || value === null) return 0;
    
    switch (factor.transform) {
      case 'linear':
        return typeof value === 'number' ? value * factor.weight * factor.importance : factor.weight * factor.importance;
      case 'boolean':
        return value ? factor.weight * factor.importance * 10 : 0;
      case 'categorical':
        return (factor.coefficients[String(value)] || 0) * factor.importance;
      default:
        return 0;
    }
  },

  generateFactorReason(value: any, factor: ScoringFactor): string {
    if (value === undefined || value === null) {
      return `${factor.field} not provided`;
    }
    
    const contribution = this.calculateFactorContribution(value, factor);
    if (contribution > 5) {
      return `${factor.field} (${value}) positively impacts score`;
    } else if (contribution < -5) {
      return `${factor.field} (${value}) negatively impacts score`;
    } else {
      return `${factor.field} (${value}) has neutral impact`;
    }
  },

  generateLeadRecommendations(score: number, tier: LeadScore['tier'], factors: any[]): string[] {
    const recommendations: string[] = [];
    
    if (tier === 'hot') {
      recommendations.push('High priority lead - contact immediately');
      recommendations.push('Consider direct phone outreach');
    } else if (tier === 'warm') {
      recommendations.push('Follow up within 24 hours');
      recommendations.push('Send personalized email sequence');
    } else {
      recommendations.push('Add to nurture campaign');
      recommendations.push('Monitor for engagement increases');
    }

    // Add factor-specific recommendations
    factors.forEach(factor => {
      if (factor.contribution < -5) {
        recommendations.push(`Improve ${factor.field} data quality`);
      }
    });

    return recommendations;
  },

  createUserVector(userData: Record<string, any>): number[] {
    // Simple vectorization of user data
    const vector: number[] = [];
    Object.values(userData).forEach(value => {
      if (typeof value === 'number') {
        vector.push(value);
      } else if (typeof value === 'string') {
        vector.push(value.length);
      } else if (typeof value === 'boolean') {
        vector.push(value ? 1 : 0);
      } else {
        vector.push(0);
      }
    });
    return vector;
  },

  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }
    
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
};
