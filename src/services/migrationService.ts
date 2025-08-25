import { supabase } from '@/integrations/supabase/client';
import { FlowPayload, validateFlowPayload } from '@/types/flowSchema';
import { FlowService } from './flowService';

/**
 * Migration Service - Handle data migration from old to new system
 * This service helps migrate flows from the relational model to JSON payload model
 */

export interface MigrationResult {
  success: boolean;
  flowId?: string;
  errors?: string[];
  migrated?: boolean;
}

export interface LegacyFlow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  settings?: any;
  google_ads_config?: any;
  style_config?: any;
  steps?: LegacyFlowStep[];
}

export interface LegacyFlowStep {
  id: string;
  step_order: number;
  step_type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  button_text?: string;
  is_required?: boolean;
  settings?: any;
  fields?: LegacyFlowField[];
}

export interface LegacyFlowField {
  id: string;
  field_order: number;
  field_type: string;
  field_name: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation_rules?: any;
  options?: any;
  default_value?: string;
}

export const MigrationService = {
  /**
   * Check if a flow needs migration (exists in old format but not new)
   */
  async needsMigration(flowId: string): Promise<boolean> {
    try {
      // Check if versioned payload exists
      const { data: versionExists } = await supabase
        .from('flow_versions')
        .select('id')
        .eq('flow_id', flowId)
        .limit(1)
        .maybeSingle();

      // Check if legacy steps exist
      const { data: stepsExist } = await supabase
        .from('flow_steps')
        .select('id')
        .eq('flow_id', flowId)
        .limit(1)
        .maybeSingle();

      // Needs migration if has legacy steps but no versioned payload
      return Boolean(stepsExist && !versionExists);
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  },

  /**
   * Get legacy flow data from relational tables
   */
  async getLegacyFlow(flowId: string): Promise<LegacyFlow | null> {
    try {
      // Get flow base data
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (flowError || !flow) {
        console.error('Failed to get legacy flow:', flowError);
        return null;
      }

      // Get steps with fields
      const { data: steps, error: stepsError } = await supabase
        .from('flow_steps')
        .select(`
          *,
          flow_fields(*)
        `)
        .eq('flow_id', flowId)
        .order('step_order');

      if (stepsError) {
        console.error('Failed to get legacy steps:', stepsError);
        return null;
      }

      // Transform to legacy format
      const legacySteps: LegacyFlowStep[] = (steps || []).map(step => ({
        id: step.id,
        step_order: step.step_order,
        step_type: step.step_type,
        title: step.title,
        subtitle: step.subtitle,
        content: step.content,
        button_text: step.button_text,
        is_required: step.is_required,
        settings: step.settings || {},
        fields: (step.flow_fields || [])
          .sort((a: any, b: any) => a.field_order - b.field_order)
          .map((field: any) => ({
            id: field.id,
            field_order: field.field_order,
            field_type: field.field_type,
            field_name: field.field_name,
            label: field.label,
            placeholder: field.placeholder,
            help_text: field.help_text,
            is_required: field.is_required,
            validation_rules: field.validation_rules || {},
            options: field.options || [],
            default_value: field.default_value,
          }))
      }));

      return {
        id: flow.id,
        name: flow.name,
        slug: flow.slug,
        description: flow.description,
        status: flow.status,
        settings: flow.settings || {},
        google_ads_config: flow.google_ads_config || {},
        style_config: flow.style_config || {},
        steps: legacySteps
      };
    } catch (error) {
      console.error('Error getting legacy flow:', error);
      return null;
    }
  },

  /**
   * Convert legacy flow to new FlowPayload format
   */
  convertToFlowPayload(legacyFlow: LegacyFlow): FlowPayload {
    const payload: FlowPayload = {
      id: legacyFlow.id,
      name: legacyFlow.name,
      slug: legacyFlow.slug,
      description: legacyFlow.description || '',
      status: legacyFlow.status as any,
      settings: {
        allowBack: true,
        showProgress: true,
        saveProgress: false,
        requireAuth: false,
        captureUtm: true,
        trackAnalytics: true,
        ...legacyFlow.settings
      },
      google_ads_config: {
        conversionId: '',
        conversionLabel: '',
        remarketingTag: false,
        enhancedConversions: false,
        ...legacyFlow.google_ads_config
      },
      style_config: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        buttonStyle: 'rounded',
        layout: 'centered',
        fontFamily: 'Inter',
        borderRadius: 8,
        shadowLevel: 'md',
        ...legacyFlow.style_config
      },
      steps: (legacyFlow.steps || []).map(step => ({
        id: step.id,
        step_order: step.step_order,
        step_type: step.step_type as any,
        title: step.title || '',
        subtitle: step.subtitle,
        content: step.content,
        button_text: step.button_text || 'Continue',
        is_required: step.is_required ?? true,
        settings: step.settings || {},
        fields: (step.fields || []).map(field => ({
          id: field.id,
          field_type: field.field_type as any,
          field_name: field.field_name,
          label: field.label,
          placeholder: field.placeholder,
          help_text: field.help_text,
          is_required: field.is_required ?? false,
          validation_rules: field.validation_rules || {},
          options: Array.isArray(field.options) ? field.options : [],
          default_value: field.default_value,
        }))
      })),
      logic: [],
      metadata: {
        migrated: true,
        migratedAt: new Date().toISOString(),
        category: 'migrated',
        tags: ['legacy-migration']
      }
    };

    return payload;
  },

  /**
   * Migrate a single flow from legacy to new format
   */
  async migrateFlow(flowId: string): Promise<MigrationResult> {
    try {
      console.log('🔄 Starting migration for flow:', flowId);

      // Check if already migrated
      const needsMig = await this.needsMigration(flowId);
      if (!needsMig) {
        return {
          success: true,
          flowId,
          migrated: false,
          errors: ['Flow already migrated or no legacy data found']
        };
      }

      // Get legacy flow data
      const legacyFlow = await this.getLegacyFlow(flowId);
      if (!legacyFlow) {
        return {
          success: false,
          errors: ['Failed to retrieve legacy flow data']
        };
      }

      // Convert to new format
      const payload = this.convertToFlowPayload(legacyFlow);

      // Validate the payload
      const validation = validateFlowPayload(payload);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Save as draft version
      const saveResult = await FlowService.saveDraft(flowId, payload);
      if (!saveResult.success) {
        return {
          success: false,
          errors: saveResult.errors
        };
      }

      // If original was active, publish the migrated version
      if (legacyFlow.status === 'active') {
        const publishResult = await FlowService.publish(flowId);
        if (!publishResult.success) {
          console.warn('Migration successful but failed to publish:', publishResult.errors);
        }
      }

      console.log('✅ Flow migration completed:', flowId);

      return {
        success: true,
        flowId,
        migrated: true
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        errors: [(error as Error).message]
      };
    }
  },

  /**
   * Migrate all flows that need migration
   */
  async migrateAllFlows(): Promise<{ total: number; migrated: number; errors: string[] }> {
    try {
      console.log('🔄 Starting bulk migration...');

      // Get all flows that might need migration
      const { data: flows, error } = await supabase
        .from('flows')
        .select('id, name, slug');

      if (error || !flows) {
        throw new Error('Failed to get flows for migration');
      }

      const results: MigrationResult[] = [];
      const errors: string[] = [];

      // Process each flow
      for (const flow of flows) {
        try {
          const result = await this.migrateFlow(flow.id);
          results.push(result);
          
          if (!result.success && result.errors) {
            errors.push(`${flow.name} (${flow.slug}): ${result.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`${flow.name} (${flow.slug}): ${(error as Error).message}`);
        }
      }

      const migratedCount = results.filter(r => r.success && r.migrated).length;

      console.log(`✅ Bulk migration completed: ${migratedCount}/${flows.length} flows migrated`);

      return {
        total: flows.length,
        migrated: migratedCount,
        errors
      };

    } catch (error) {
      console.error('❌ Bulk migration failed:', error);
      return {
        total: 0,
        migrated: 0,
        errors: [(error as Error).message]
      };
    }
  },

  /**
   * Get migration status for all flows
   */
  async getMigrationStatus(): Promise<{
    totalFlows: number;
    migratedFlows: number;
    needingMigration: number;
    details: Array<{ id: string; name: string; slug: string; migrated: boolean }>;
  }> {
    try {
      // Get all flows
      const { data: flows, error } = await supabase
        .from('flows')
        .select('id, name, slug');

      if (error || !flows) {
        throw new Error('Failed to get flows');
      }

      const details = [];
      let migratedCount = 0;
      let needingCount = 0;

      for (const flow of flows) {
        const needsMig = await this.needsMigration(flow.id);
        const migrated = !needsMig;
        
        details.push({
          id: flow.id,
          name: flow.name,
          slug: flow.slug,
          migrated
        });

        if (migrated) {
          migratedCount++;
        } else {
          needingCount++;
        }
      }

      return {
        totalFlows: flows.length,
        migratedFlows: migratedCount,
        needingMigration: needingCount,
        details
      };

    } catch (error) {
      console.error('Error getting migration status:', error);
      return {
        totalFlows: 0,
        migratedFlows: 0,
        needingMigration: 0,
        details: []
      };
    }
  }
};
