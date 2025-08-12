import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { FlowService } from '@/services/flowService';
import type { FlowPayload, FlowPayloadField, FlowPayloadStep } from '@/types/flowSchema';
import { useNavigate } from 'react-router-dom';

type FlowType = 'guide_landing' | 'simple_form';

const defaultFields: Array<{ key: string; label: string; type: FlowPayloadField['field_type']; required?: boolean; placeholder?: string }>
  = [
    { key: 'first_name', label: 'First name', type: 'text', required: true, placeholder: 'First name' },
    { key: 'last_name', label: 'Last name', type: 'text', placeholder: 'Last name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone', type: 'phone', placeholder: '(555) 123-4567' },
    { key: 'zip', label: 'ZIP code', type: 'zip', required: true, placeholder: '90210' },
  ];

export default function FlowCreateWizard() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('Housing Application Guide');
  const [slug, setSlug] = useState('housing-application-guide');
  const [flowType, setFlowType] = useState<FlowType>('guide_landing');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [buttonText, setButtonText] = useState('Download Application Guide');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [benefitsImageUrl, setBenefitsImageUrl] = useState('');
  const [benefitsTitle, setBenefitsTitle] = useState('What Do I Get When Signing Up?');
  const [showSteps, setShowSteps] = useState(true);
  const [showBenefits, setShowBenefits] = useState(true);
  const [legalText, setLegalText] = useState('');
  const [layoutStyle, setLayoutStyle] = useState<'backgroundCentered' | 'heroTop' | 'formLeft'>('backgroundCentered');
  const [formLayout, setFormLayout] = useState<'grid' | 'stacked'>('grid');
  const [multiStep, setMultiStep] = useState(false);
  const [phoneOnSecondPage, setPhoneOnSecondPage] = useState(true);
  const [secondStepTitle, setSecondStepTitle] = useState('One last step');
  const [secondStepSubtitle, setSecondStepSubtitle] = useState('Confirm your phone number to receive helpful alerts');
  const [secondStepButtonText, setSecondStepButtonText] = useState('Continue');
  const [phoneConsentText, setPhoneConsentText] = useState('By providing your number you agree to receive messages; Msg & data rates may apply. Reply STOP to opt out.');
  const [addRedirect, setAddRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [redirectDelay, setRedirectDelay] = useState(3);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    first_name: true,
    last_name: false,
    email: true,
    phone: false,
    zip: true,
  });
  const [creating, setCreating] = useState(false);

  const slugFromName = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const fieldList = useMemo(() => defaultFields.filter(f => selectedFields[f.key]), [selectedFields]);
  const firstPageFieldDefs = useMemo(() => fieldList.filter(f => !(multiStep && phoneOnSecondPage && f.key === 'phone')), [fieldList, multiStep, phoneOnSecondPage]);
  const secondPageFieldDefs = useMemo(() => (multiStep && phoneOnSecondPage && selectedFields.phone ? defaultFields.filter(f => f.key === 'phone') : []), [multiStep, phoneOnSecondPage, selectedFields]);

  const buildFieldsFromDefs = (defs: typeof defaultFields, stepIndex: number): FlowPayloadField[] => {
    return defs.map((f, idx) => ({
      id: `${stepIndex}-${idx}`,
      field_type: f.type,
      field_name: f.key,
      label: f.label,
      placeholder: f.placeholder,
      is_required: Boolean(f.required),
    }));
  };

  const buildSteps = (): FlowPayloadStep[] => {
    if (flowType === 'guide_landing') {
      const landing: FlowPayloadStep = {
        id: 'landing-1',
        step_order: 1,
        step_type: 'single_page_landing',
        title: 'Apply Here For:',
        subtitle: 'Section 8 Vouchers Government Housing Rental Assistance and more',
        content: legalText || 'By clicking "Download Application Guide", I represent that I am 18+ years of age; I understand that this site is and is not endorsed or supported by any government agency...',
        button_text: buttonText,
        fields: buildFieldsFromDefs(firstPageFieldDefs, 0),
        settings: {
          layout: 'full',
          module: 1,
          layoutType: layoutStyle === 'formLeft' ? 'formLeft' : 'centered',
          usePageBackground: layoutStyle === 'backgroundCentered',
          imageMode: layoutStyle === 'heroTop' ? 'heroTop' : layoutStyle === 'formLeft' ? undefined : undefined,
          formLayout,
          logo: logoUrl || undefined,
          heroImage: heroImageUrl || undefined,
          benefitsImageUrl: benefitsImageUrl || undefined,
          showProgressSteps: showSteps,
          showBenefits: showBenefits,
          benefitsTitle,
          trustBadgePreset: 'standard',
          stepsPreset: 'section8Housing',
          benefitPreset: 'section8'
        },
      } as any;

      const steps: FlowPayloadStep[] = [landing];

      if (multiStep && secondPageFieldDefs.length > 0) {
        steps.push({
          id: 'phone-2',
          step_order: 2,
          step_type: 'form',
          title: secondStepTitle,
          subtitle: secondStepSubtitle,
          button_text: secondStepButtonText,
          content: phoneConsentText,
          fields: buildFieldsFromDefs(secondPageFieldDefs, 1),
        } as any);
      }

      const thankyou: FlowPayloadStep = {
        id: 'thanks-final',
        step_order: steps.length + 1,
        step_type: 'thank_you',
        title: 'Thank you! Your guide is ready',
        subtitle: 'Check your email for next steps',
        ...(addRedirect && redirectUrl
          ? { redirect_url: redirectUrl, redirect_delay: Number(redirectDelay) || 3 }
          : {}),
      } as any;

      steps.push(thankyou);
      return steps;
    }

    // simple_form
    const intro: FlowPayloadStep = {
      id: 'intro-1',
      step_order: 1,
      step_type: 'content',
      title: 'Welcome',
      subtitle: 'Answer a few questions to get started',
      content: '',
    } as any;

    const form: FlowPayloadStep = {
      id: 'form-2',
      step_order: 2,
      step_type: 'form',
      title: 'Your details',
      button_text: 'Submit',
      fields: buildFieldsFromDefs(firstPageFieldDefs, 1),
    } as any;

    const steps: FlowPayloadStep[] = [intro, form];

    if (multiStep && secondPageFieldDefs.length > 0) {
      steps.push({
        id: 'phone-3',
        step_order: 3,
        step_type: 'form',
        title: secondStepTitle,
        subtitle: secondStepSubtitle,
        button_text: secondStepButtonText,
        content: phoneConsentText,
        fields: buildFieldsFromDefs(secondPageFieldDefs, 2),
      } as any);
    }

    const thankyou: FlowPayloadStep = {
      id: 'thanks-final',
      step_order: steps.length + 1,
      step_type: 'thank_you',
      title: 'Thanks! We received your info',
      ...(addRedirect && redirectUrl
        ? { redirect_url: redirectUrl, redirect_delay: Number(redirectDelay) || 3 }
        : {}),
    } as any;

    steps.push(thankyou);
    return steps;
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please provide a name.' });
      return;
    }
    if (!slug.trim()) {
      toast({ title: 'Slug required', description: 'Please provide a URL slug.' });
      return;
    }
    if (addRedirect && !redirectUrl.trim()) {
      toast({ title: 'Redirect URL missing', description: 'Add a URL or disable redirect.' });
      return;
    }

    const payload: FlowPayload = {
      name,
      slug,
      description: flowType === 'guide_landing' ? 'Guide landing page' : 'Simple lead form',
      status: 'draft',
      settings: {},
      google_ads_config: {},
      style_config: {
        primaryColor,
        backgroundColor: '#F8FAFC',
        buttonStyle: 'rounded',
        layout: flowType === 'guide_landing' ? 'full' : 'centered',
        logoUrl: logoUrl || undefined,
        heroImageUrl: heroImageUrl || undefined,
      },
      steps: buildSteps(),
      logic: [],
      metadata: flowType === 'guide_landing' ? { guideMode: true } : {},
    };

    setCreating(true);
    try {
      const saved = await FlowService.saveDraft(null, payload);
      await FlowService.publish(saved.flowId);
      toast({ title: 'Created', description: 'Your flow is live.' });
      navigate('/admin/flows');
      // Open live page in new tab for convenience
      window.open(`/flow/${slug}`, '_blank');
    } catch (e: any) {
      toast({ title: 'Failed to create', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Guide/Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || slug === slugFromName(name)) {
                    setSlug(slugFromName(e.target.value));
                  }
                }}
                placeholder="e.g., Housing Application Guide"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugFromName(e.target.value))}
                placeholder="e.g., housing-application-guide"
              />
              <p className="text-xs text-gray-500 mt-1">/flow/{slug || 'your-slug'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={flowType} onValueChange={(v: FlowType) => setFlowType(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide_landing">Guide Landing (single page)</SelectItem>
                    <SelectItem value="simple_form">Simple Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Primary Color</Label>
                <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
            </div>

            {flowType === 'guide_landing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Logo URL</Label>
                  <Input placeholder="https://...logo.png" value={logoUrl} onChange={(e)=>setLogoUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Hero Image URL</Label>
                  <Input placeholder="https://...hero.jpg" value={heroImageUrl} onChange={(e)=>setHeroImageUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Benefits Image URL</Label>
                  <Input placeholder="https://...benefits.jpg" value={benefitsImageUrl} onChange={(e)=>setBenefitsImageUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Button Text</Label>
                  <Input value={buttonText} onChange={(e)=>setButtonText(e.target.value)} />
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={layoutStyle} onValueChange={(v: any)=>setLayoutStyle(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backgroundCentered">Background Centered (overlay)</SelectItem>
                      <SelectItem value="heroTop">Hero Top (white background)</SelectItem>
                      <SelectItem value="formLeft">Form Left (image right)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Form Layout</Label>
                  <Select value={formLayout} onValueChange={(v:any)=>setFormLayout(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">2x2 Grid (First, Last, Email, Zip)</SelectItem>
                      <SelectItem value="stacked">Stacked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Label>Show Steps Section</Label>
                  <Switch size="xs" checked={showSteps} onCheckedChange={(c)=>setShowSteps(Boolean(c))} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Label>Show Benefits Section</Label>
                  <Switch size="xs" checked={showBenefits} onCheckedChange={(c)=>setShowBenefits(Boolean(c))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Benefits Title</Label>
                  <Input value={benefitsTitle} onChange={(e)=>setBenefitsTitle(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Legal/Consent Text (small print)</Label>
                  <Input placeholder="Legal text below the form" value={legalText} onChange={(e)=>setLegalText(e.target.value)} />
                </div>
                <div className="md:col-span-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Make it multi-step (phone on page 2)</Label>
                    <Switch size="xs" checked={multiStep} onCheckedChange={(c)=>setMultiStep(Boolean(c))} />
                  </div>
                  {multiStep && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Second Step Title</Label>
                        <Input value={secondStepTitle} onChange={(e)=>setSecondStepTitle(e.target.value)} />
                      </div>
                      <div>
                        <Label>Second Step Subtitle</Label>
                        <Input value={secondStepSubtitle} onChange={(e)=>setSecondStepSubtitle(e.target.value)} />
                      </div>
                      <div>
                        <Label>Second Step Button</Label>
                        <Input value={secondStepButtonText} onChange={(e)=>setSecondStepButtonText(e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Phone Consent Text</Label>
                        <Input value={phoneConsentText} onChange={(e)=>setPhoneConsentText(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Collect These Fields</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {defaultFields.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <Switch size="xs"
                      checked={!!selectedFields[f.key]}
                      onCheckedChange={(c) => setSelectedFields((prev) => ({ ...prev, [f.key]: Boolean(c) }))}
                    />
                    <span>{f.label}{f.required ? ' *' : ''}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Redirect after completion</Label>
                <Switch size="xs" checked={addRedirect} onCheckedChange={(c) => setAddRedirect(Boolean(c))} />
              </div>
              {addRedirect && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-3">
                  <Input placeholder="https://example.com/thank-you" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} />
                  <Input type="number" min={0} max={30} value={redirectDelay} onChange={(e) => setRedirectDelay(Number(e.target.value))} />
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create and Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


