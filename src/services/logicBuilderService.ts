import { supabase } from '@/integrations/supabase/client';
import { FlowPayload, FlowPayloadStep } from '@/types/flowSchema';

/**
 * Advanced Logic Builder Service for Complex Business Rules and Personalization
 * Handles conditional logic, dynamic routing, personalization rules, and smart field population
 */

export interface LogicRule {
  id: string;
  name: string;
  description?: string;
  type: 'conditional_step' | 'field_population' | 'routing' | 'personalization' | 'validation';
  trigger: LogicTrigger;
  conditions: LogicCondition[];
  actions: LogicAction[];
  priority: number;
  enabled: boolean;
  flowId: string;
  stepId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogicTrigger {
  event: 'step_enter' | 'step_complete' | 'field_change' | 'flow_start' | 'timer' | 'external_event';
  stepId?: string;
  fieldId?: string;
  delay?: number; // milliseconds for timer trigger
}

export interface LogicCondition {
  id: string;
  field: string; // Field name or system property
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex' | 'is_empty' | 'is_not_empty';
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
  logicalOperator?: 'AND' | 'OR';
}

export interface LogicAction {
  id: string;
  type: 'show_step' | 'hide_step' | 'skip_to_step' | 'set_field_value' | 'show_field' | 'hide_field' | 'send_email' | 'call_webhook' | 'update_styling' | 'show_message' | 'redirect' | 'calculate_score';
  config: LogicActionConfig;
}

export interface LogicActionConfig {
  // Step actions
  targetStepId?: string;
  
  // Field actions
  targetFieldId?: string;
  value?: any;
  
  // Styling actions
  css?: Record<string, string>;
  className?: string;
  
  // Message actions
  message?: string;
  messageType?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  
  // External actions
  webhookUrl?: string;
  emailTemplate?: string;
  emailRecipient?: string;
  
  // Redirect actions
  url?: string;
  target?: '_blank' | '_self';
  
  // Calculation actions
  formula?: string;
  targetField?: string;
}

export interface PersonalizationProfile {
  id: string;
  name: string;
  description: string;
  conditions: LogicCondition[];
  personalizations: PersonalizationRule[];
  priority: number;
  enabled: boolean;
}

export interface PersonalizationRule {
  element: 'step_title' | 'step_subtitle' | 'button_text' | 'placeholder' | 'help_text' | 'css_class' | 'image_src';
  stepId?: string;
  fieldId?: string;
  value: string;
  type: 'text' | 'html' | 'css' | 'url';
}

export interface SmartFieldRule {
  id: string;
  fieldId: string;
  type: 'auto_populate' | 'smart_suggestions' | 'validation' | 'formatting';
  config: {
    dataSource?: 'previous_response' | 'external_api' | 'database' | 'calculation';
    sourceField?: string;
    apiUrl?: string;
    formula?: string;
    format?: string;
    suggestions?: string[];
    validationRule?: string;
    errorMessage?: string;
  };
}

export interface LogicFlowAnalytics {
  ruleId: string;
  ruleName: string;
  executions: number;
  successRate: number;
  avgExecutionTime: number;
  lastExecuted: string;
  impactOnConversion: number;
}

export const LogicBuilderService = {
  /**
   * Get all logic rules for a flow
   */
  async getFlowLogicRules(flowId: string): Promise<LogicRule[]> {
    try {
      const { data, error } = await supabase
        .from('logic_rules')
        .select('*')
        .eq('flow_id', flowId)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get logic rules:', error);
      return [];
    }
  },

  /**
   * Create a new logic rule
   */
  async createLogicRule(ruleData: Omit<LogicRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; ruleId?: string; errors?: string[] }> {
    try {
      // Validate rule syntax
      const validation = this.validateLogicRule(ruleData);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      const { data: rule, error } = await supabase
        .from('logic_rules')
        .insert({
          ...ruleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true, ruleId: rule.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Update logic rule
   */
  async updateLogicRule(
    ruleId: string,
    updates: Partial<LogicRule>
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      if (updates.conditions || updates.actions) {
        const validation = this.validateLogicRule(updates as any);
        if (!validation.valid) {
          return { success: false, errors: validation.errors };
        }
      }

      const { error } = await supabase
        .from('logic_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Execute logic rules for a session
   */
  async executeLogicRules(
    flowId: string,
    sessionData: Record<string, any>,
    trigger: LogicTrigger
  ): Promise<{ actions: LogicAction[]; personalizations: PersonalizationRule[]; errors?: string[] }> {
    try {
      // Get active rules for this flow
      const rules = await this.getFlowLogicRules(flowId);
      const activeRules = rules
        .filter(rule => rule.enabled)
        .filter(rule => this.matchesTrigger(rule.trigger, trigger))
        .sort((a, b) => a.priority - b.priority);

      const actions: LogicAction[] = [];
      const personalizations: PersonalizationRule[] = [];
      const errors: string[] = [];

      // Get personalization profiles
      const profiles = await this.getPersonalizationProfiles(flowId);
      const activeProfiles = profiles
        .filter(profile => profile.enabled)
        .filter(profile => this.evaluateConditions(sessionData, profile.conditions))
        .sort((a, b) => a.priority - b.priority);

      // Add personalization rules
      activeProfiles.forEach(profile => {
        personalizations.push(...profile.personalizations);
      });

      // Execute logic rules
      for (const rule of activeRules) {
        try {
          const startTime = Date.now();
          
          // Evaluate conditions
          if (this.evaluateConditions(sessionData, rule.conditions)) {
            actions.push(...rule.actions);
            
            // Track execution
            await this.trackRuleExecution(rule.id, true, Date.now() - startTime);
          }
        } catch (error) {
          console.error(`Failed to execute rule ${rule.id}:`, error);
          errors.push(`Rule '${rule.name}': ${(error as Error).message}`);
          
          // Track failed execution
          await this.trackRuleExecution(rule.id, false, 0);
        }
      }

      return { actions, personalizations, errors };
    } catch (error) {
      return { 
        actions: [], 
        personalizations: [], 
        errors: [(error as Error).message] 
      };
    }
  },

  /**
   * Create smart field population rules
   */
  async createSmartFieldRules(
    flowId: string,
    fieldRules: SmartFieldRule[]
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const rulesWithFlowId = fieldRules.map(rule => ({
        ...rule,
        flow_id: flowId,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('smart_field_rules')
        .insert(rulesWithFlowId);

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get smart field suggestions
   */
  async getSmartFieldSuggestions(
    flowId: string,
    fieldId: string,
    currentValue: string,
    sessionData: Record<string, any>
  ): Promise<string[]> {
    try {
      // Get field rules
      const { data: rules } = await supabase
        .from('smart_field_rules')
        .select('*')
        .eq('flow_id', flowId)
        .eq('field_id', fieldId)
        .eq('type', 'smart_suggestions');

      if (!rules || rules.length === 0) {
        return [];
      }

      const suggestions: string[] = [];

      for (const rule of rules) {
        switch (rule.config.dataSource) {
          case 'previous_response':
            // Get suggestions from previous responses
            const previousSuggestions = await this.getPreviousResponseSuggestions(
              fieldId,
              currentValue
            );
            suggestions.push(...previousSuggestions);
            break;

          case 'external_api':
            // Get suggestions from external API
            if (rule.config.apiUrl) {
              const apiSuggestions = await this.getApiSuggestions(
                rule.config.apiUrl,
                currentValue,
                sessionData
              );
              suggestions.push(...apiSuggestions);
            }
            break;

          default:
            // Static suggestions
            if (rule.config.suggestions) {
              const filteredSuggestions = rule.config.suggestions.filter(s =>
                s.toLowerCase().includes(currentValue.toLowerCase())
              );
              suggestions.push(...filteredSuggestions);
            }
        }
      }

      // Remove duplicates and limit results
      return [...new Set(suggestions)].slice(0, 10);
    } catch (error) {
      console.error('Failed to get smart field suggestions:', error);
      return [];
    }
  },

  /**
   * Auto-populate field based on rules
   */
  async autoPopulateField(
    flowId: string,
    fieldId: string,
    sessionData: Record<string, any>
  ): Promise<any> {
    try {
      const { data: rules } = await supabase
        .from('smart_field_rules')
        .select('*')
        .eq('flow_id', flowId)
        .eq('field_id', fieldId)
        .eq('type', 'auto_populate')
        .limit(1);

      if (!rules || rules.length === 0) {
        return null;
      }

      const rule = rules[0];
      
      switch (rule.config.dataSource) {
        case 'previous_response':
          return sessionData[rule.config.sourceField!] || null;

        case 'calculation':
          if (rule.config.formula) {
            return this.evaluateFormula(rule.config.formula, sessionData);
          }
          return null;

        case 'external_api':
          if (rule.config.apiUrl) {
            return await this.fetchExternalData(rule.config.apiUrl, sessionData);
          }
          return null;

        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to auto-populate field:', error);
      return null;
    }
  },

  /**
   * Get personalization profiles for flow
   */
  async getPersonalizationProfiles(flowId: string): Promise<PersonalizationProfile[]> {
    try {
      const { data, error } = await supabase
        .from('personalization_profiles')
        .select('*')
        .eq('flow_id', flowId)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get personalization profiles:', error);
      return [];
    }
  },

  /**
   * Create personalization profile
   */
  async createPersonalizationProfile(
    flowId: string,
    profileData: Omit<PersonalizationProfile, 'id'>
  ): Promise<{ success: boolean; profileId?: string; errors?: string[] }> {
    try {
      const { data: profile, error } = await supabase
        .from('personalization_profiles')
        .insert({
          ...profileData,
          flow_id: flowId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true, profileId: profile.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get logic rule analytics
   */
  async getLogicAnalytics(flowId: string): Promise<LogicFlowAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('logic_rule_analytics')
        .select(`
          *,
          logic_rule:logic_rules(name)
        `)
        .eq('flow_id', flowId)
        .order('executions', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => ({
        ruleId: record.rule_id,
        ruleName: record.logic_rule?.name || 'Unknown Rule',
        executions: record.executions || 0,
        successRate: record.success_rate || 0,
        avgExecutionTime: record.avg_execution_time || 0,
        lastExecuted: record.last_executed,
        impactOnConversion: record.impact_on_conversion || 0
      }));
    } catch (error) {
      console.error('Failed to get logic analytics:', error);
      return [];
    }
  },

  // Private helper methods

  validateLogicRule(rule: Partial<LogicRule>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!rule.name?.trim()) {
      errors.push('Rule name is required');
    }

    if (!rule.type) {
      errors.push('Rule type is required');
    }

    if (!rule.trigger) {
      errors.push('Trigger is required');
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('At least one condition is required');
    }

    if (!rule.actions || rule.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Validate conditions
    rule.conditions?.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condition ${index + 1}: Field is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index + 1}: Operator is required`);
      }
    });

    // Validate actions
    rule.actions?.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index + 1}: Type is required`);
      }
      
      // Type-specific validation
      switch (action.type) {
        case 'show_step':
        case 'hide_step':
        case 'skip_to_step':
          if (!action.config.targetStepId) {
            errors.push(`Action ${index + 1}: Target step ID is required`);
          }
          break;
        case 'set_field_value':
        case 'show_field':
        case 'hide_field':
          if (!action.config.targetFieldId) {
            errors.push(`Action ${index + 1}: Target field ID is required`);
          }
          break;
      }
    });

    return { valid: errors.length === 0, errors };
  },

  matchesTrigger(ruleTrigger: LogicTrigger, currentTrigger: LogicTrigger): boolean {
    if (ruleTrigger.event !== currentTrigger.event) {
      return false;
    }

    if (ruleTrigger.stepId && ruleTrigger.stepId !== currentTrigger.stepId) {
      return false;
    }

    if (ruleTrigger.fieldId && ruleTrigger.fieldId !== currentTrigger.fieldId) {
      return false;
    }

    return true;
  },

  evaluateConditions(sessionData: Record<string, any>, conditions: LogicCondition[]): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(sessionData, conditions[0]);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(sessionData, condition);

      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  },

  evaluateCondition(sessionData: Record<string, any>, condition: LogicCondition): boolean {
    const fieldValue = sessionData[condition.field];
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(conditionValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      case 'regex':
        try {
          const regex = new RegExp(conditionValue);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      case 'is_empty':
        return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
      case 'is_not_empty':
        return fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
      default:
        return false;
    }
  },

  evaluateFormula(formula: string, data: Record<string, any>): any {
    try {
      // Simple formula evaluation (in production, use a proper expression parser)
      // This is a simplified implementation for demo purposes
      let expression = formula;
      
      // Replace field references with actual values
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expression = expression.replace(regex, String(value));
      });

      // Basic math evaluation (very simplified)
      // In production, use a proper math expression evaluator
      if (/^[\d\s+\-*/.()]+$/.test(expression)) {
        return Function(`"use strict"; return (${expression})`)();
      }

      return null;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return null;
    }
  },

  async getPreviousResponseSuggestions(fieldId: string, currentValue: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('leads')
        .select('responses')
        .not('responses', 'is', null)
        .limit(100);

      if (!data) return [];

      const suggestions = new Set<string>();
      
      data.forEach(lead => {
        const response = lead.responses[fieldId];
        if (response && typeof response === 'string') {
          if (response.toLowerCase().includes(currentValue.toLowerCase())) {
            suggestions.add(response);
          }
        }
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Failed to get previous response suggestions:', error);
      return [];
    }
  },

  async getApiSuggestions(apiUrl: string, currentValue: string, sessionData: Record<string, any>): Promise<string[]> {
    try {
      // Replace placeholders in API URL
      let url = apiUrl;
      Object.entries(sessionData).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
      });

      const response = await fetch(`${url}?q=${encodeURIComponent(currentValue)}`);
      if (!response.ok) return [];

      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
      console.error('Failed to get API suggestions:', error);
      return [];
    }
  },

  async fetchExternalData(apiUrl: string, sessionData: Record<string, any>): Promise<any> {
    try {
      // Replace placeholders in API URL
      let url = apiUrl;
      Object.entries(sessionData).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
      });

      const response = await fetch(url);
      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch external data:', error);
      return null;
    }
  },

  async trackRuleExecution(ruleId: string, success: boolean, executionTime: number): Promise<void> {
    try {
      // Update or create analytics record
      const { data: existing } = await supabase
        .from('logic_rule_analytics')
        .select('*')
        .eq('rule_id', ruleId)
        .single();

      if (existing) {
        // Update existing record
        const newExecutions = existing.executions + 1;
        const newSuccessful = success ? existing.successful_executions + 1 : existing.successful_executions;
        const newAvgTime = Math.round(
          (existing.avg_execution_time * existing.executions + executionTime) / newExecutions
        );

        await supabase
          .from('logic_rule_analytics')
          .update({
            executions: newExecutions,
            successful_executions: newSuccessful,
            success_rate: Math.round((newSuccessful / newExecutions) * 100),
            avg_execution_time: newAvgTime,
            last_executed: new Date().toISOString()
          })
          .eq('rule_id', ruleId);
      } else {
        // Create new record
        await supabase
          .from('logic_rule_analytics')
          .insert({
            rule_id: ruleId,
            executions: 1,
            successful_executions: success ? 1 : 0,
            success_rate: success ? 100 : 0,
            avg_execution_time: executionTime,
            last_executed: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to track rule execution:', error);
    }
  }
};
