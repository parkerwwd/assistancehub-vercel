import { supabase } from '@/integrations/supabase/client';
import { FlowPayload, FlowPayloadSchema } from '@/types/flowSchema';

// FlowService: unified CRUD for versioned flows

export const FlowService = {
  async getPublishedBySlug(slug: string): Promise<{ payload: FlowPayload; flowId: string } | null> {
    // Try new versioned table first
    const { data: versionRow, error } = await supabase
      .from('flow_versions')
      .select('payload, flow_id')
      .eq('slug', slug)
      .eq('status', 'published')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && versionRow?.payload && versionRow?.flow_id) {
      const parse = FlowPayloadSchema.safeParse(versionRow.payload);
      if (parse.success) return { payload: parse.data, flowId: versionRow.flow_id };
      console.warn('Invalid versioned flow payload', parse.error);
    }
    return null;
  },

  async getDraftVersion(flowId: string): Promise<FlowPayload | null> {
    const { data: versionRow } = await supabase
      .from('flow_versions')
      .select('payload')
      .eq('flow_id', flowId)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    const parse = versionRow?.payload ? FlowPayloadSchema.safeParse(versionRow.payload) : null;
    return parse && 'success' in parse && parse.success ? parse.data : null;
  },

  async saveDraft(flowId: string | null, payload: FlowPayload): Promise<{ flowId: string; version: number }> {
    const parsed = FlowPayloadSchema.parse(payload);
    // Create base flow record if necessary
    let ensuredFlowId = flowId;
    if (!ensuredFlowId) {
      const { data: newFlow, error } = await supabase
        .from('flows')
        .insert({ name: parsed.name, slug: parsed.slug, description: parsed.description, status: 'draft', settings: parsed.settings, google_ads_config: parsed.google_ads_config, style_config: parsed.style_config })
        .select('id')
        .single();
      if (error) throw error;
      ensuredFlowId = newFlow.id;
    }

    // Next version number
    const { data: latest } = await supabase
      .from('flow_versions')
      .select('version')
      .eq('flow_id', ensuredFlowId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = (latest?.version || 0) + 1;

    const { error: insertErr } = await supabase
      .from('flow_versions')
      .insert({ flow_id: ensuredFlowId, slug: parsed.slug, status: 'draft', version: nextVersion, payload: parsed });
    if (insertErr) throw insertErr;

    return { flowId: ensuredFlowId!, version: nextVersion };
  },

  async publish(flowId: string): Promise<{ version: number }> {
    // Mark latest draft as published and update flows table
    const { data: latestDraft, error } = await supabase
      .from('flow_versions')
      .select('*')
      .eq('flow_id', flowId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !latestDraft) throw error || new Error('No draft version to publish');

    await supabase
      .from('flow_versions')
      .update({ status: 'published' })
      .eq('flow_id', flowId)
      .eq('version', latestDraft.version);

    await supabase
      .from('flows')
      .update({ status: 'active', slug: latestDraft.slug, style_config: latestDraft.payload?.style_config || {} })
      .eq('id', flowId);

    await supabase
      .from('flow_audit')
      .insert({ flow_id: flowId, action: 'publish', meta: { version: latestDraft.version } });

    return { version: latestDraft.version };
  },
};

export type { FlowPayload };


