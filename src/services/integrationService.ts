import { supabase } from '@/integrations/supabase/client';

/**
 * CRM Integration Service for Enterprise Workflow Automation
 * Handles integrations with Salesforce, HubSpot, Zapier, and custom webhooks
 */

export interface Integration {
  id: string;
  name: string;
  type: 'salesforce' | 'hubspot' | 'zapier' | 'webhook' | 'email' | 'slack';
  status: 'active' | 'inactive' | 'error' | 'pending';
  config: IntegrationConfig;
  flowMappings: FlowMapping[];
  stats: IntegrationStats;
  createdAt: string;
  lastSync?: string;
  errorMessage?: string;
}

export interface IntegrationConfig {
  // Common fields
  apiKey?: string;
  apiUrl?: string;
  
  // Salesforce specific
  clientId?: string;
  clientSecret?: string;
  sandbox?: boolean;
  
  // HubSpot specific
  portalId?: string;
  
  // Webhook specific
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  
  // Email specific
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  
  // Slack specific
  webhookUrl?: string;
  channel?: string;
}

export interface FlowMapping {
  id: string;
  flowId: string;
  flowName: string;
  integrationId: string;
  enabled: boolean;
  fieldMappings: FieldMapping[];
  conditions: MappingCondition[];
  actions: IntegrationAction[];
}

export interface FieldMapping {
  sourceField: string; // Lead field name
  targetField: string; // CRM field name
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'custom';
  customTransform?: string; // JavaScript expression
  required: boolean;
}

export interface MappingCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface IntegrationAction {
  type: 'create_lead' | 'create_contact' | 'create_deal' | 'send_email' | 'send_notification';
  config: Record<string, any>;
}

export interface IntegrationStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastWeekSyncs: number;
  averageResponseTime: number; // milliseconds
}

export interface SyncResult {
  success: boolean;
  recordId?: string;
  errors?: string[];
  responseTime: number;
  data?: any;
}

export const IntegrationService = {
  /**
   * Get all integrations
   */
  async getIntegrations(): Promise<Integration[]> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select(`
          *,
          flow_mappings(
            *,
            flows(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(integration => ({
        ...integration,
        flowMappings: integration.flow_mappings.map((mapping: any) => ({
          ...mapping,
          flowName: mapping.flows?.name || 'Unknown Flow'
        }))
      }));
    } catch (error) {
      console.error('Failed to get integrations:', error);
      return [];
    }
  },

  /**
   * Create new integration
   */
  async createIntegration(integrationData: {
    name: string;
    type: Integration['type'];
    config: IntegrationConfig;
  }): Promise<{ success: boolean; integrationId?: string; errors?: string[] }> {
    try {
      // Validate configuration first
      const validation = await this.validateIntegrationConfig(integrationData.type, integrationData.config);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          name: integrationData.name,
          type: integrationData.type,
          status: 'pending',
          config: integrationData.config,
          stats: {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            lastWeekSyncs: 0,
            averageResponseTime: 0
          }
        })
        .select()
        .single();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      // Test the integration
      const testResult = await this.testIntegration(integration.id);
      
      // Update status based on test result
      await supabase
        .from('integrations')
        .update({ 
          status: testResult.success ? 'active' : 'error',
          error_message: testResult.success ? null : testResult.errors?.join(', ')
        })
        .eq('id', integration.id);

      return { success: true, integrationId: integration.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Update integration configuration
   */
  async updateIntegration(
    integrationId: string,
    updates: Partial<Integration>
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      if (updates.config) {
        const integration = await this.getIntegration(integrationId);
        if (!integration) {
          return { success: false, errors: ['Integration not found'] };
        }

        const validation = await this.validateIntegrationConfig(integration.type, updates.config);
        if (!validation.valid) {
          return { success: false, errors: validation.errors };
        }
      }

      const { error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', integrationId);

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get single integration with mappings
   */
  async getIntegration(integrationId: string): Promise<Integration | null> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select(`
          *,
          flow_mappings(*)
        `)
        .eq('id', integrationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get integration:', error);
      return null;
    }
  },

  /**
   * Test integration connection
   */
  async testIntegration(integrationId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        return { success: false, errors: ['Integration not found'] };
      }

      const startTime = Date.now();
      let result: SyncResult;

      switch (integration.type) {
        case 'salesforce':
          result = await this.testSalesforceConnection(integration.config);
          break;
        case 'hubspot':
          result = await this.testHubSpotConnection(integration.config);
          break;
        case 'webhook':
          result = await this.testWebhookConnection(integration.config);
          break;
        case 'email':
          result = await this.testEmailConnection(integration.config);
          break;
        default:
          return { success: false, errors: ['Unsupported integration type'] };
      }

      // Update stats
      await this.updateIntegrationStats(integrationId, result);

      return {
        success: result.success,
        errors: result.errors
      };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Sync lead data to CRM
   */
  async syncLeadData(leadId: string, flowId: string): Promise<{ success: boolean; results: SyncResult[] }> {
    try {
      // Get lead data
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!lead) {
        return { success: false, results: [] };
      }

      // Get active integrations for this flow
      const { data: mappings } = await supabase
        .from('flow_mappings')
        .select(`
          *,
          integration:integrations(*)
        `)
        .eq('flow_id', flowId)
        .eq('enabled', true)
        .eq('integrations.status', 'active');

      if (!mappings || mappings.length === 0) {
        return { success: true, results: [] };
      }

      const syncResults: SyncResult[] = [];

      // Process each integration
      for (const mapping of mappings) {
        try {
          // Check conditions
          if (!this.evaluateConditions(lead.responses, mapping.conditions)) {
            continue;
          }

          // Transform data
          const transformedData = this.transformLeadData(lead, mapping);

          // Sync to integration
          const result = await this.executeIntegrationActions(
            mapping.integration,
            transformedData,
            mapping.actions
          );

          syncResults.push(result);

          // Update integration stats
          await this.updateIntegrationStats(mapping.integration.id, result);

        } catch (error) {
          console.error(`Failed to sync to ${mapping.integration.name}:`, error);
          syncResults.push({
            success: false,
            errors: [(error as Error).message],
            responseTime: 0
          });
        }
      }

      return {
        success: syncResults.every(r => r.success),
        results: syncResults
      };
    } catch (error) {
      console.error('Failed to sync lead data:', error);
      return { success: false, results: [] };
    }
  },

  /**
   * Create flow mapping
   */
  async createFlowMapping(mappingData: {
    flowId: string;
    integrationId: string;
    fieldMappings: FieldMapping[];
    conditions: MappingCondition[];
    actions: IntegrationAction[];
  }): Promise<{ success: boolean; mappingId?: string; errors?: string[] }> {
    try {
      const { data: mapping, error } = await supabase
        .from('flow_mappings')
        .insert({
          ...mappingData,
          enabled: true
        })
        .select()
        .single();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      return { success: true, mappingId: mapping.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  // Private helper methods

  async validateIntegrationConfig(type: Integration['type'], config: IntegrationConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    switch (type) {
      case 'salesforce':
        if (!config.clientId) errors.push('Client ID is required');
        if (!config.clientSecret) errors.push('Client Secret is required');
        break;
      case 'hubspot':
        if (!config.apiKey) errors.push('API Key is required');
        if (!config.portalId) errors.push('Portal ID is required');
        break;
      case 'webhook':
        if (!config.url) errors.push('Webhook URL is required');
        if (!config.method) errors.push('HTTP method is required');
        break;
      case 'email':
        if (!config.smtpHost) errors.push('SMTP Host is required');
        if (!config.username) errors.push('Username is required');
        if (!config.password) errors.push('Password is required');
        break;
    }

    return { valid: errors.length === 0, errors };
  },

  async testSalesforceConnection(config: IntegrationConfig): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      // Salesforce OAuth flow (simplified)
      const tokenUrl = config.sandbox 
        ? 'https://test.salesforce.com/services/oauth2/token'
        : 'https://login.salesforce.com/services/oauth2/token';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientId!,
          client_secret: config.clientSecret!,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          errors: ['Failed to authenticate with Salesforce'],
          responseTime
        };
      }

      const tokenData = await response.json();
      
      return {
        success: true,
        responseTime,
        data: { accessToken: tokenData.access_token }
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        responseTime: Date.now() - startTime
      };
    }
  },

  async testHubSpotConnection(config: IntegrationConfig): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?limit=1`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          errors: ['Failed to connect to HubSpot API'],
          responseTime
        };
      }

      return {
        success: true,
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        responseTime: Date.now() - startTime
      };
    }
  },

  async testWebhookConnection(config: IntegrationConfig): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(config.url!, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        }),
      });

      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        errors: response.ok ? undefined : [`HTTP ${response.status}: ${response.statusText}`],
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        responseTime: Date.now() - startTime
      };
    }
  },

  async testEmailConnection(config: IntegrationConfig): Promise<SyncResult> {
    const startTime = Date.now();
    
    // In a real implementation, you'd test SMTP connection
    // For now, just validate configuration
    try {
      if (!config.smtpHost || !config.username || !config.password) {
        return {
          success: false,
          errors: ['Incomplete SMTP configuration'],
          responseTime: Date.now() - startTime
        };
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        responseTime: Date.now() - startTime
      };
    }
  },

  evaluateConditions(leadData: any, conditions: MappingCondition[]): boolean {
    return conditions.every(condition => {
      const value = leadData[condition.field];
      const conditionValue = condition.value;

      switch (condition.operator) {
        case 'equals':
          return value === conditionValue;
        case 'not_equals':
          return value !== conditionValue;
        case 'contains':
          return String(value).includes(conditionValue);
        case 'greater_than':
          return Number(value) > Number(conditionValue);
        case 'less_than':
          return Number(value) < Number(conditionValue);
        default:
          return true;
      }
    });
  },

  transformLeadData(lead: any, mapping: FlowMapping): Record<string, any> {
    const transformed: Record<string, any> = {};

    mapping.fieldMappings.forEach(fieldMapping => {
      let value = lead.responses[fieldMapping.sourceField] || lead[fieldMapping.sourceField];

      if (value !== undefined && value !== null) {
        // Apply transformations
        switch (fieldMapping.transform) {
          case 'uppercase':
            value = String(value).toUpperCase();
            break;
          case 'lowercase':
            value = String(value).toLowerCase();
            break;
          case 'trim':
            value = String(value).trim();
            break;
          case 'custom':
            // In a real implementation, you'd safely evaluate the custom transform
            break;
        }

        transformed[fieldMapping.targetField] = value;
      } else if (fieldMapping.required) {
        throw new Error(`Required field ${fieldMapping.sourceField} is missing`);
      }
    });

    return transformed;
  },

  async executeIntegrationActions(
    integration: Integration,
    data: Record<string, any>,
    actions: IntegrationAction[]
  ): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      for (const action of actions) {
        switch (action.type) {
          case 'create_lead':
          case 'create_contact':
            if (integration.type === 'salesforce') {
              await this.createSalesforceRecord(integration, data, action);
            } else if (integration.type === 'hubspot') {
              await this.createHubSpotRecord(integration, data, action);
            }
            break;
          case 'send_email':
            await this.sendEmail(integration, data, action);
            break;
          case 'send_notification':
            await this.sendNotification(integration, data, action);
            break;
        }
      }

      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        responseTime: Date.now() - startTime
      };
    }
  },

  async createSalesforceRecord(integration: Integration, data: Record<string, any>, action: IntegrationAction): Promise<void> {
    // Implement Salesforce record creation
    // This would use the Salesforce REST API
  },

  async createHubSpotRecord(integration: Integration, data: Record<string, any>, action: IntegrationAction): Promise<void> {
    // Implement HubSpot record creation
    // This would use the HubSpot CRM API
  },

  async sendEmail(integration: Integration, data: Record<string, any>, action: IntegrationAction): Promise<void> {
    // Implement email sending
    // This would use nodemailer or similar
  },

  async sendNotification(integration: Integration, data: Record<string, any>, action: IntegrationAction): Promise<void> {
    // Implement notification sending (Slack, etc.)
  },

  async updateIntegrationStats(integrationId: string, result: SyncResult): Promise<void> {
    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('stats')
        .eq('id', integrationId)
        .single();

      if (!integration) return;

      const stats = integration.stats as IntegrationStats;
      const newStats: IntegrationStats = {
        totalSyncs: stats.totalSyncs + 1,
        successfulSyncs: result.success ? stats.successfulSyncs + 1 : stats.successfulSyncs,
        failedSyncs: result.success ? stats.failedSyncs : stats.failedSyncs + 1,
        lastWeekSyncs: stats.lastWeekSyncs + 1, // This should be calculated properly
        averageResponseTime: Math.round(
          (stats.averageResponseTime * stats.totalSyncs + result.responseTime) / (stats.totalSyncs + 1)
        )
      };

      await supabase
        .from('integrations')
        .update({ 
          stats: newStats,
          last_sync: new Date().toISOString()
        })
        .eq('id', integrationId);
    } catch (error) {
      console.error('Failed to update integration stats:', error);
    }
  }
};
