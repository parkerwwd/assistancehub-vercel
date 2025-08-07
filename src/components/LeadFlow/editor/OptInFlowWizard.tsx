import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FlowStatus } from '@/types/leadFlow';
import AssetManagerDialog from './AssetManagerDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SinglePageLandingStep from '@/components/LeadFlow/steps/SinglePageLandingStep';
import type { FlowStepWithFields, FieldValues, FieldType } from '@/types/leadFlow';

type OptInFlowWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (flowId: string) => void;
  flowId?: string; // if provided, acts as Quick Edit
};

const defaultHero = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop';

export default function OptInFlowWizard({ open, onOpenChange, onCompleted, flowId }: OptInFlowWizardProps) {
  const [name, setName] = useState('Housing Application Guide');
  const [slug, setSlug] = useState('housing-application-guide');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [layoutType, setLayoutType] = useState<'centered' | 'heroSplit' | 'formLeft'>('centered');
  const [heroImage, setHeroImage] = useState(defaultHero);
  const [logoUrl, setLogoUrl] = useState('');
  const [ctaText, setCtaText] = useState('Download Application Guide');
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const [redirectUrl, setRedirectUrl] = useState('/section8');
  const [redirectDelay, setRedirectDelay] = useState(5);
  const [imagePlacement, setImagePlacement] = useState<'hero' | 'page' | 'heroTop' | 'heroRight'>('hero');
  const [includeFirstName, setIncludeFirstName] = useState(true);
  const [includeLastName, setIncludeLastName] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includeZip, setIncludeZip] = useState(true);
  const [includeConsent, setIncludeConsent] = useState(true);
  const [saving, setSaving] = useState(false);
  const isEdit = !!flowId;
  const [assetOpen, setAssetOpen] = useState<{
    target: 'hero' | 'logo' | null;
    open: boolean;
  }>({ target: null, open: false });
  const [previewValues, setPreviewValues] = useState<FieldValues>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const generatedSlug = useMemo(() => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return base || 'new-flow';
  }, [name]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === '' || slug === generatedSlug) {
      setSlug(val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const buildFields = () => {
    const fields: any[] = [];
    let order = 1;
    if (includeFirstName) fields.push({ field_order: order++, field_type: 'text', field_name: 'firstName', label: 'First Name', placeholder: 'First Name', is_required: true });
    if (includeLastName) fields.push({ field_order: order++, field_type: 'text', field_name: 'lastName', label: 'Last Name', placeholder: 'Last Name', is_required: true });
    if (includeEmail) fields.push({ field_order: order++, field_type: 'email', field_name: 'email', label: 'Email', placeholder: 'you@example.com', is_required: true, validation_rules: { type: 'email' } });
    if (includeZip) fields.push({ field_order: order++, field_type: 'zip', field_name: 'zipCode', label: 'ZIP Code', placeholder: '12345', is_required: true });
    if (includeConsent) fields.push({ field_order: order++, field_type: 'checkbox', field_name: 'consent', label: 'I agree to receive updates about housing assistance', placeholder: '', is_required: true, options: [{ label: 'Yes, keep me updated', value: 'yes' }] });
    return fields;
  };

  const handleCreate = async () => {
    if (!name || !slug) {
      toast({ title: 'Missing info', description: 'Please provide a name and slug.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Create flow
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .insert({
          name,
          slug,
          description: 'Quick opt-in landing flow',
          status: FlowStatus.DRAFT,
          style_config: {
            primaryColor,
            backgroundColor: '#F8FAFC',
            heroImageUrl: heroImage,
            logoUrl,
            layout: 'centered',
            buttonStyle: 'rounded'
          },
          google_ads_config: {},
        })
        .select()
        .single();

      if (flowError || !flow) throw flowError || new Error('Failed to create flow');

      // Create single page landing step
      const settings = {
        layoutType,
        heroImage,
        logo: logoUrl,
        buttonText: ctaText,
        buttonColor,
        usePageBackground: imagePlacement === 'page',
        imageMode: imagePlacement,
        trustBadgePreset: 'standard',
        benefitPreset: 'section8',
        stepsPreset: 'section8Housing',
        showProgressSteps: layoutType !== 'formLeft',
        showBenefits: true,
        primaryColor,
      } as any;

      const { data: landingStep, error: stepError } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flow.id,
          step_order: 1,
          step_type: 'single_page_landing',
          title: 'Apply for Section 8 Housing',
          subtitle: 'Get your free application guide and next steps',
          content: '',
          button_text: ctaText,
          is_required: true,
          settings,
        })
        .select()
        .single();

      if (stepError || !landingStep) throw stepError || new Error('Failed to create landing step');

      // Insert fields for landing step
      const fields = buildFields();
      if (fields.length > 0) {
        const insertFields = fields.map((f) => ({ ...f, step_id: landingStep.id }));
        const { error: fieldsError } = await supabase.from('flow_fields').insert(insertFields);
        if (fieldsError) throw fieldsError;
      }

      // Thank you step with optional redirect
      const { error: thankError } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flow.id,
          step_order: 2,
          step_type: 'thank_you',
          title: 'You’re all set! 🎉',
          subtitle: 'We’ll email your guide shortly',
          content: '',
          is_required: false,
          redirect_url: redirectUrl || null,
          redirect_delay: redirectUrl ? redirectDelay : null,
          settings: {},
        });

      if (thankError) throw thankError;

      toast({ title: 'Flow created', description: 'Your opt-in flow is ready for editing.' });
      onCompleted(flow.id);
      onOpenChange(false);
    } catch (e: any) {
      console.error('Error creating opt-in flow:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to create flow', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Load existing flow for quick edit
  React.useEffect(() => {
    const load = async () => {
      if (!open || !isEdit || !flowId) return;
      try {
        const { data: flow, error } = await supabase
          .from('flows')
          .select(`*, steps:flow_steps(*, fields:flow_fields(*))`)
          .eq('id', flowId)
          .single();
        if (error || !flow) throw error || new Error('Flow not found');

        // Basics
        setName(flow.name || '');
        setSlug(flow.slug || '');
        const sc: any = flow.style_config || {};
        if (sc.primaryColor) setPrimaryColor(sc.primaryColor);
        if (sc.heroImageUrl && !heroImage) setHeroImage(sc.heroImageUrl);
        if (sc.logoUrl) setLogoUrl(sc.logoUrl);

        // Find landing step
        const landing = (flow as any).steps?.find((s: any) => s.step_type === 'single_page_landing');
        if (landing) {
          const cfg = landing.settings || {};
          setLayoutType((cfg.layoutType as any) || 'centered');
          if (cfg.heroImage) setHeroImage(cfg.heroImage);
          if (cfg.logo) setLogoUrl(cfg.logo);
          if (cfg.buttonText) setCtaText(cfg.buttonText);
          if (cfg.buttonColor) setButtonColor(cfg.buttonColor);
          setImagePlacement(cfg.imageMode || (cfg.usePageBackground ? 'page' : 'hero'));
          // fields toggles
          const fns = (landing.fields || []).map((f: any) => f.field_name);
          setIncludeFirstName(fns.includes('firstName'));
          setIncludeLastName(fns.includes('lastName'));
          setIncludeEmail(fns.includes('email'));
          setIncludeZip(fns.includes('zipCode') || fns.includes('zip'));
          setIncludeConsent(fns.includes('consent'));
        }

        // Find thank you for redirect
        const thank = (flow as any).steps?.find((s: any) => s.step_type === 'thank_you');
        if (thank) {
          if (thank.redirect_url) setRedirectUrl(thank.redirect_url);
          if (typeof thank.redirect_delay === 'number') setRedirectDelay(thank.redirect_delay);
        }
      } catch (e) {
        console.error('Failed to load flow for quick edit:', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flowId]);

  const handleSaveEdit = async () => {
    if (!flowId) return;
    setSaving(true);
    try {
      // Update flow basics
      const { error: flowError } = await supabase
        .from('flows')
        .update({
          name,
          slug,
          style_config: {
            primaryColor,
            backgroundColor: '#F8FAFC',
            heroImageUrl: heroImage,
            logoUrl,
            layout: 'centered',
            buttonStyle: 'rounded'
          }
        })
        .eq('id', flowId);
      if (flowError) throw flowError;

      // Fetch steps to locate landing and thank-you
      const { data: stepsData, error: stepsError } = await supabase
        .from('flow_steps')
        .select('*, fields:flow_fields(*)')
        .eq('flow_id', flowId)
        .order('step_order', { ascending: true });
      if (stepsError) throw stepsError;

      const landing = (stepsData as any[])?.find(s => s.step_type === 'single_page_landing');
      const thank = (stepsData as any[])?.find(s => s.step_type === 'thank_you');

      // Update or create landing
      const settings: any = {
        layoutType,
        heroImage,
        logo: logoUrl,
        buttonText: ctaText,
        buttonColor,
        usePageBackground: imagePlacement === 'page',
        imageMode: imagePlacement,
        trustBadgePreset: 'standard',
        benefitPreset: 'section8',
        stepsPreset: 'section8Housing',
        showProgressSteps: layoutType !== 'formLeft',
        showBenefits: true,
        primaryColor,
      };

      let landingStepId: string | null = null;
      if (landing) {
        const { error: upErr } = await supabase
          .from('flow_steps')
          .update({
            title: 'Apply for Section 8 Housing',
            subtitle: 'Get your free application guide and next steps',
            button_text: ctaText,
            settings
          })
          .eq('id', landing.id);
        if (upErr) throw upErr;
        landingStepId = landing.id;
      } else {
        const { data: ins, error: insErr } = await supabase
          .from('flow_steps')
          .insert({
            flow_id: flowId,
            step_order: (stepsData?.length || 0) + 1,
            step_type: 'single_page_landing',
            title: 'Apply for Section 8 Housing',
            subtitle: 'Get your free application guide and next steps',
            button_text: ctaText,
            is_required: true,
            settings,
          })
          .select()
          .single();
        if (insErr || !ins) throw insErr || new Error('Failed to create landing step');
        landingStepId = ins.id as string;
      }

      // Replace landing fields with current selections
      if (landingStepId) {
        const { error: delErr } = await supabase.from('flow_fields').delete().eq('step_id', landingStepId);
        if (delErr) throw delErr;
        const fields = buildFields();
        if (fields.length > 0) {
          const insertFields = fields.map((f) => ({ ...f, step_id: landingStepId }));
          const { error: fieldsError } = await supabase.from('flow_fields').insert(insertFields);
          if (fieldsError) throw fieldsError;
        }
      }

      // Update or create thank-you for redirect
      if (thank) {
        const { error: tErr } = await supabase
          .from('flow_steps')
          .update({ redirect_url: redirectUrl || null, redirect_delay: redirectUrl ? redirectDelay : null })
          .eq('id', thank.id);
        if (tErr) throw tErr;
      } else {
        const { error: tInsErr } = await supabase
          .from('flow_steps')
          .insert({
            flow_id: flowId,
            step_order: (stepsData?.length || 0) + 2,
            step_type: 'thank_you',
            title: 'You’re all set! 🎉',
            subtitle: 'We’ll email your guide shortly',
            redirect_url: redirectUrl || null,
            redirect_delay: redirectUrl ? redirectDelay : null,
            is_required: false,
          });
        if (tInsErr) throw tInsErr;
      }

      toast({ title: 'Changes saved', description: 'Your flow was updated.' });
      onCompleted(flowId);
      onOpenChange(false);
    } catch (e: any) {
      console.error('Quick edit failed:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create an Opt-In Flow</DialogTitle>
          <DialogDescription>Set layout, fields, branding, and redirect in one step.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left: Basics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Flow Name</Label>
                <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Housing Application Guide" />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={generatedSlug} />
                <p className="text-xs text-gray-500 mt-1">URL: /flow/{slug || generatedSlug}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Layout</Label>
                  <Select value={layoutType} onValueChange={(v: any) => setLayoutType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered (hero + form card)</SelectItem>
                      <SelectItem value="heroSplit">Hero Split (content + form)</SelectItem>
                      <SelectItem value="formLeft">Form Left (competitor style)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hero Image URL</Label>
                  <div className="flex gap-2">
                    <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." />
                    <Button type="button" variant="outline" onClick={() => setAssetOpen({ target: 'hero', open: true })}>Browse</Button>
                  </div>
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <div className="flex gap-2">
                    <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                    <Button type="button" variant="outline" onClick={() => setAssetOpen({ target: 'logo', open: true })}>Browse</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Image Placement</Label>
                  <Select value={imagePlacement} onValueChange={(v: any) => setImagePlacement(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero (section background)</SelectItem>
                      <SelectItem value="page">Full Page Background</SelectItem>
                      <SelectItem value="heroTop">Hero Top (white page)</SelectItem>
                      <SelectItem value="heroRight">Hero Right (white page)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Button Text</Label>
                  <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
                </div>
                <div>
                  <Label>Button Color</Label>
                  <Input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Redirect URL (after submit)</Label>
                  <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="/section8 or https://..." />
                </div>
                <div>
                  <Label>Redirect Delay (seconds)</Label>
                  <Input type="number" min={0} max={60} value={redirectDelay} onChange={(e) => setRedirectDelay(parseInt(e.target.value || '0', 10))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Fields and Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2">
                  <Checkbox checked={includeFirstName} onCheckedChange={(v) => setIncludeFirstName(!!v)} />
                  <span>First Name</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={includeLastName} onCheckedChange={(v) => setIncludeLastName(!!v)} />
                  <span>Last Name</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={includeEmail} onCheckedChange={(v) => setIncludeEmail(!!v)} />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={includeZip} onCheckedChange={(v) => setIncludeZip(!!v)} />
                  <span>ZIP Code</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={includeConsent} onCheckedChange={(v) => setIncludeConsent(!!v)} />
                  <span>Consent (required)</span>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="live">
                  <TabsList className="mb-3">
                    <TabsTrigger value="live">Live</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium">Layout:</span> {layoutType}</div>
                      <div><span className="font-medium">Image Mode:</span> {imagePlacement}</div>
                      <div><span className="font-medium">Fields:</span> {buildFields().map(f => f.label).join(', ') || 'None'}</div>
                      <div><span className="font-medium">Redirect:</span> {redirectUrl || 'None'}{redirectUrl ? ` (in ${redirectDelay}s)` : ''}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium">Primary:</span>
                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="live">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <Button type="button" variant={previewDevice === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('desktop')}>Desktop</Button>
                        <Button type="button" variant={previewDevice === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('mobile')}>Mobile</Button>
                      </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${previewDevice === 'mobile' ? 'max-w-[420px]' : 'w-full'} mx-auto`}>
                      {(() => {
                        const fields = buildFields();
                        const settings: any = {
                          layoutType,
                          heroImage,
                          logo: logoUrl,
                          buttonText: ctaText,
                          buttonColor,
                          usePageBackground: imagePlacement === 'page',
                          imageMode: imagePlacement,
                          primaryColor
                        };
                        const step: FlowStepWithFields = {
                          id: 'preview',
                          flow_id: 'preview',
                          step_order: 1,
                          step_type: 'single_page_landing',
                          title: 'Apply for Section 8 Housing',
                          subtitle: 'Get your free application guide and next steps',
                          content: '',
                          button_text: ctaText,
                          button_back_text: null as any,
                          is_required: true as any,
                          skip_logic: null as any,
                          navigation_logic: null as any,
                          validation_rules: null as any,
                          redirect_url: null as any,
                          redirect_delay: null as any,
                          settings,
                          created_at: '' as any,
                          updated_at: '' as any,
                          fields: fields as any
                        };
                        return (
                          <div className="bg-white">
                            <SinglePageLandingStep
                              step={step}
                              onChange={(name, value) => setPreviewValues(prev => ({ ...prev, [name]: value }))}
                              values={previewValues}
                              onComplete={() => {}}
                              styleConfig={{ primaryColor }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
              {isEdit ? (
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Flow'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <AssetManagerDialog
        open={assetOpen.open}
        onOpenChange={(o) => setAssetOpen(prev => ({ ...prev, open: o, target: o ? prev.target : null }))}
        onSelect={(url) => {
          if (assetOpen.target === 'hero') setHeroImage(url);
          if (assetOpen.target === 'logo') setLogoUrl(url);
          setAssetOpen({ target: null, open: false });
        }}
      />
    </Dialog>
  );
}


