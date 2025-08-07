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

type OptInFlowWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (flowId: string) => void;
};

const defaultHero = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop';

export default function OptInFlowWizard({ open, onOpenChange, onCreated }: OptInFlowWizardProps) {
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
  const [includeFirstName, setIncludeFirstName] = useState(true);
  const [includeLastName, setIncludeLastName] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includeZip, setIncludeZip] = useState(true);
  const [includeConsent, setIncludeConsent] = useState(true);
  const [saving, setSaving] = useState(false);

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
      onCreated(flow.id);
      onOpenChange(false);
    } catch (e: any) {
      console.error('Error creating opt-in flow:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to create flow', variant: 'destructive' });
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
                  <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
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
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Layout:</span> {layoutType}</div>
                  <div><span className="font-medium">Fields:</span> {buildFields().map(f => f.label).join(', ') || 'None'}</div>
                  <div><span className="font-medium">Redirect:</span> {redirectUrl || 'None'}{redirectUrl ? ` (in ${redirectDelay}s)` : ''}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">Primary:</span>
                    <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : 'Create Flow'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


