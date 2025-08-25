import { supabase } from '@/integrations/supabase/client';
import { 
  FlowPayload, 
  FlowPayloadSchema,
  validateFlowPayload,
  validateStep
} from '@/types/flowSchema';
import { validateStep as registryValidateStep } from '@/components/LeadFlow/stepRegistry';

// Enhanced FlowService: unified CRUD for versioned flows with proper validation
// No more type casting - everything properly validated!

// Service result types for better error handling
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  payload: FlowPayload;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export const FlowService = {
  /**
   * Get published flow by slug with proper validation
   */
  async getPublishedBySlug(slug: string): Promise<ServiceResult<{ payload: FlowPayload; flowId: string }>> {
    try {
      const { data: versionRow, error } = await supabase
        .from('flow_versions')
        .select('payload, flow_id, id, version, created_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      if (!versionRow?.payload || !versionRow?.flow_id) {
        return { success: false, errors: ['Flow not found or not published'] };
      }

      // Validate payload with enhanced validation
      const validation = validateFlowPayload(versionRow.payload);
      if (!validation.success) {
        console.warn('Invalid published flow payload:', validation.errors);
        return { success: false, errors: validation.errors || ['Invalid flow structure'] };
      }

      return {
        success: true,
        data: { payload: validation.data!, flowId: versionRow.flow_id }
      };
    } catch (error) {
      console.error('Error fetching published flow:', error);
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get latest draft version with validation
   */
  async getDraftVersion(flowId: string): Promise<ServiceResult<FlowPayload>> {
    try {
      const { data: versionRow, error } = await supabase
        .from('flow_versions')
        .select('payload, id, version')
        .eq('flow_id', flowId)
        .eq('status', 'draft')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return { success: false, errors: [error.message] };
      }

      if (!versionRow?.payload) {
        return { success: false, errors: ['No draft version found'] };
      }

      const validation = validateFlowPayload(versionRow.payload);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      return { success: true, data: validation.data! };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Save draft with comprehensive validation
   */
  async saveDraft(flowId: string | null, payload: FlowPayload): Promise<ServiceResult<{ flowId: string; version: number }>> {
    try {
      // Validate payload structure
      const validation = validateFlowPayload(payload);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }
      
      const validatedPayload = validation.data!;
      
      // Validate each step using registry
      const stepErrors: string[] = [];
      for (const [index, step] of validatedPayload.steps.entries()) {
        const stepValidation = registryValidateStep(step);
        if (!stepValidation.isValid) {
          stepErrors.push(...stepValidation.errors.map(err => `Step ${index + 1}: ${err}`));
        }
      }
      
      if (stepErrors.length > 0) {
        return { success: false, errors: stepErrors };
      }

      // Create base flow record if necessary
      let ensuredFlowId = flowId;
      if (!ensuredFlowId) {
        const { data: newFlow, error } = await supabase
          .from('flows')
          .insert({
            name: validatedPayload.name,
            slug: validatedPayload.slug,
            description: validatedPayload.description,
            status: 'draft',
            settings: validatedPayload.settings,
            google_ads_config: validatedPayload.google_ads_config,
            style_config: validatedPayload.style_config
          })
          .select('id')
          .single();
          
        if (error) {
          return { success: false, errors: [error.message] };
        }
        ensuredFlowId = newFlow.id;
      }

      // Get next version number
      const { data: latest } = await supabase
        .from('flow_versions')
        .select('version')
        .eq('flow_id', ensuredFlowId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      const nextVersion = (latest?.version || 0) + 1;

      // Insert new version
      const { error: insertErr } = await supabase
        .from('flow_versions')
        .insert({
          flow_id: ensuredFlowId,
          slug: validatedPayload.slug,
          status: 'draft',
          version: nextVersion,
          payload: validatedPayload
        });
        
      if (insertErr) {
        return { success: false, errors: [insertErr.message] };
      }

      // Add audit trail
      await supabase
        .from('flow_audit')
        .insert({
          flow_id: ensuredFlowId,
          action: 'save_draft',
          meta: { version: nextVersion }
        });

      return {
        success: true,
        data: { flowId: ensuredFlowId!, version: nextVersion }
      };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Publish flow with validation
   */
  async publish(flowId: string): Promise<ServiceResult<{ version: number }>> {
    try {
      // Get latest draft with validation
      const { data: latestDraft, error } = await supabase
        .from('flow_versions')
        .select('*')
        .eq('flow_id', flowId)
        .eq('status', 'draft')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        return { success: false, errors: [error.message] };
      }
      
      if (!latestDraft) {
        return { success: false, errors: ['No draft version found to publish'] };
      }

      // Validate payload before publishing
      const validation = validateFlowPayload(latestDraft.payload);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      // Archive any existing published version
      await supabase
        .from('flow_versions')
        .update({ status: 'archived' })
        .eq('flow_id', flowId)
        .eq('status', 'published');

      // Mark this version as published
      const { error: publishError } = await supabase
        .from('flow_versions')
        .update({ status: 'published' })
        .eq('flow_id', flowId)
        .eq('version', latestDraft.version);
        
      if (publishError) {
        return { success: false, errors: [publishError.message] };
      }

      // Update flows table
      const { error: flowUpdateError } = await supabase
        .from('flows')
        .update({
          status: 'active',
          slug: latestDraft.slug,
          style_config: validation.data!.style_config
        })
        .eq('id', flowId);
        
      if (flowUpdateError) {
        return { success: false, errors: [flowUpdateError.message] };
      }

      // Add audit trail
      await supabase
        .from('flow_audit')
        .insert({
          flow_id: flowId,
          action: 'publish',
          meta: { version: latestDraft.version }
        });

      return {
        success: true,
        data: { version: latestDraft.version }
      };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * List all flows with basic info
   */
  async listFlows(): Promise<ServiceResult<Array<{ id: string; name: string; slug: string; status: string; updatedAt: string }>>> {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('id, name, slug, status, updated_at')
        .order('updated_at', { ascending: false });
        
      if (error) {
        return { success: false, errors: [error.message] };
      }
      
      return {
        success: true,
        data: (data || []).map(flow => ({
          id: flow.id,
          name: flow.name,
          slug: flow.slug,
          status: flow.status,
          updatedAt: flow.updated_at
        }))
      };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Delete flow and all versions
   */
  async deleteFlow(flowId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId);
        
      if (error) {
        return { success: false, errors: [error.message] };
      }
      
      // Add audit trail
      await supabase
        .from('flow_audit')
        .insert({
          flow_id: flowId,
          action: 'delete',
          meta: {}
        });
      
      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  }
};

// Re-export types for convenience
export type { FlowPayload, ServiceResult, FlowVersion };

// Legacy compatibility helpers - to be removed after migration
export const FlowServiceLegacy = {
  // Wrapper for old code that expects thrown errors
  async getPublishedBySlug(slug: string): Promise<{ payload: FlowPayload; flowId: string } | null> {
    const result = await FlowService.getPublishedBySlug(slug);
    return result.success ? result.data! : null;
  },
  
  async getDraftVersion(flowId: string): Promise<FlowPayload | null> {
    const result = await FlowService.getDraftVersion(flowId);
    return result.success ? result.data! : null;
  },
  
  async saveDraft(flowId: string | null, payload: FlowPayload): Promise<{ flowId: string; version: number }> {
    const result = await FlowService.saveDraft(flowId, payload);
    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Failed to save draft');
    }
    return result.data!;
  },
  
  async publish(flowId: string): Promise<{ version: number }> {
    const result = await FlowService.publish(flowId);
    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Failed to publish flow');
    }
    return result.data!;
  }
};