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
  defaultMode?: 'flow' | 'guide';
};

const defaultHero = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop';

export default function OptInFlowWizard({ open, onOpenChange, onCompleted, flowId, defaultMode = 'flow' }: OptInFlowWizardProps) {
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
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0); // 0 Basic, 1 Content, 2 Review
  const [includeUTMs, setIncludeUTMs] = useState(true);
  const [isGuide, setIsGuide] = useState(defaultMode === 'guide');
  const [loadedSteps, setLoadedSteps] = useState<any[]>([]);
  // Editable content for steps/benefits
  const [stepsPreset, setStepsPreset] = useState<'section8Housing' | 'generalApplication'>('section8Housing');
  const [useCustomSteps, setUseCustomSteps] = useState(false);
  const [step1Text, setStep1Text] = useState('');
  const [step2Text, setStep2Text] = useState('');
  const [step3Text, setStep3Text] = useState('');
  const [benefitPreset, setBenefitPreset] = useState<'section8' | 'general' | 'premium'>('section8');
  const [useCustomBenefits, setUseCustomBenefits] = useState(false);
  const [benefitsTitle, setBenefitsTitle] = useState('What Do I Get When Signing Up?');
  const [benefitsMultiline, setBenefitsMultiline] = useState('');
  const [qbOpen, setQbOpen] = useState(false);
  const [qbItems, setQbItems] = useState<Array<{ id: string; question_text: string; options: any; correct_values: any }>>([]);
  const [qbLoading, setQbLoading] = useState(false);
  const themePresets = [
    { id: 'teal', name: 'Teal', primary: '#00B8A9', button: '#00B8A9', hero: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop' },
    { id: 'blue', name: 'Blue', primary: '#3B82F6', button: '#3B82F6', hero: defaultHero },
    { id: 'neutral', name: 'Neutral', primary: '#334155', button: '#111827', hero: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c4f3?q=80&w=1200&auto=format&fit=crop' }
  ];
  const [dbThemes, setDbThemes] = useState<any[]>([]);
  const [dbBundles, setDbBundles] = useState<any[]>([]);

  React.useEffect(() => {
    const loadPresets = async () => {
      try {
        const { data: themes } = await supabase.from('flow_presets').select('*').eq('kind','theme').eq('is_active', true);
        const { data: bundles } = await supabase.from('flow_presets').select('*').eq('kind','field_bundle').eq('is_active', true);
        setDbThemes(themes || []);
        setDbBundles(bundles || []);
      } catch (_) {}
    };
    loadPresets();
  }, []);

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
    if (includeUTMs) {
      fields.push({ field_order: order++, field_type: 'hidden', field_name: 'utm_source', label: 'utm_source', is_required: false });
      fields.push({ field_order: order++, field_type: 'hidden', field_name: 'utm_medium', label: 'utm_medium', is_required: false });
      fields.push({ field_order: order++, field_type: 'hidden', field_name: 'utm_campaign', label: 'utm_campaign', is_required: false });
    }
    return fields;
  };

  const applyBundle = (bundle: 'minimal' | 'leadgen') => {
    if (bundle === 'minimal') {
      setIncludeFirstName(true); setIncludeLastName(false); setIncludeEmail(true); setIncludeZip(true); setIncludeConsent(true);
    } else {
      setIncludeFirstName(true); setIncludeLastName(true); setIncludeEmail(true); setIncludeZip(true); setIncludeConsent(true);
    }
  };

  const applyTheme = (id: string) => {
    const t = themePresets.find(p => p.id === id);
    if (!t) return;
    setPrimaryColor(t.primary);
    setButtonColor(t.button);
    setHeroImage(t.hero);
  };

  const handleCreate = async () => {
    if (!name || !slug) {
      toast({ title: 'Missing info', description: 'Please provide a name and slug.', variant: 'destructive' });
      return;
    }
    if (!/^[-a-z0-9]+$/.test(slug)) {
      toast({ title: 'Invalid slug', description: 'Use lowercase letters, numbers, and dashes only.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Ensure slug is unique
      const { data: existing } = await supabase.from('flows').select('id').eq('slug', slug).maybeSingle();
      let finalSlug = slug;
      if (existing) {
        finalSlug = `${slug}-${Date.now().toString().slice(-5)}`;
      }
      // Create flow
      const { data: flow, error: flowError } = await supabase
        .from('flows')
        .insert({
          name,
          slug: finalSlug,
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
          metadata: isGuide ? { guideMode: true, passThreshold: 70, allowRetake: true } : {}
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
        stepsPreset,
        customSteps: useCustomSteps ? [
          { number: 1, description: step1Text, color: '#10B981' },
          { number: 2, description: step2Text, color: '#F59E0B' },
          { number: 3, description: step3Text, color: '#3B82F6' },
        ] : [],
        benefitPreset,
        benefitsTitle,
        customBenefits: useCustomBenefits ? benefitsMultiline.split('\n').map(s => s.trim()).filter(Boolean) : [],
        trustBadgePreset: 'standard',
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

      // Optional guide Module 1 (Content + Quiz)
      let thankYouOrder = 2;
      if (isGuide) {
        thankYouOrder = 4;
        const { error: mod1ContentErr } = await supabase
          .from('flow_steps')
          .insert({
            flow_id: flow.id,
            step_order: 2,
            step_type: 'content',
            title: 'Module 1: Introduction',
            subtitle: 'Learn the basics before taking a short quiz',
            content: '<p>Welcome to Module 1. This brief lesson introduces core concepts about Section 8 and affordable housing.</p>',
            is_required: true,
            settings: { module: 1 }
          });
        if (mod1ContentErr) throw mod1ContentErr;

        const { data: mod1Quiz, error: mod1QuizErr } = await supabase
          .from('flow_steps')
          .insert({
            flow_id: flow.id,
            step_order: 3,
            step_type: 'quiz',
            title: 'Module 1 Quiz',
            subtitle: 'Answer to continue',
            is_required: true,
            settings: { module: 1, allowRetake: true }
          })
          .select()
          .single();
        if (mod1QuizErr || !mod1Quiz) throw mod1QuizErr || new Error('Failed to create Module 1 quiz');

        const { error: mod1FieldErr } = await supabase.from('flow_fields').insert({
          step_id: mod1Quiz.id,
          field_order: 1,
          field_type: 'radio',
          field_name: 'module1_q1',
          label: 'What is Section 8 also known as?',
          is_required: true,
          options: [
            { value: 'hcv', label: 'Housing Choice Voucher Program', correct: true },
            { value: 'lifeline', label: 'Housing Lifeline Program' },
            { value: 'public', label: 'Public Rental Support' },
          ]
        });
        if (mod1FieldErr) throw mod1FieldErr;
      }

      // Thank you step with optional redirect
      const { error: thankError } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flow.id,
          step_order: thankYouOrder,
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

        // Keep steps for quick operations
        setLoadedSteps((flow as any).steps || []);

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
          if (cfg.stepsPreset) setStepsPreset(cfg.stepsPreset);
          if (Array.isArray(cfg.customSteps) && cfg.customSteps.length >= 3) {
            setUseCustomSteps(true);
            setStep1Text(cfg.customSteps[0]?.description || '');
            setStep2Text(cfg.customSteps[1]?.description || '');
            setStep3Text(cfg.customSteps[2]?.description || '');
          }
          if (cfg.benefitPreset) setBenefitPreset(cfg.benefitPreset);
          if (typeof cfg.benefitsTitle === 'string') setBenefitsTitle(cfg.benefitsTitle);
          if (Array.isArray(cfg.customBenefits) && cfg.customBenefits.length > 0) {
            setUseCustomBenefits(true);
            setBenefitsMultiline(cfg.customBenefits.join('\n'));
          }
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

  // Quick Add Module (for existing guide flows)
  const handleAddModule = async () => {
    if (!isEdit || !flowId) return;
    try {
      // Fetch current steps fresh
      const { data: steps } = await supabase
        .from('flow_steps')
        .select('*')
        .eq('flow_id', flowId)
        .order('step_order', { ascending: true });
      const stepsArr = steps || [];
      const thank = stepsArr.find(s => s.step_type === 'thank_you');
      const maxOrder = stepsArr.reduce((m, s) => Math.max(m, s.step_order || 0), 0);
      const modules = stepsArr
        .filter(s => s.settings && typeof (s as any).settings.module === 'number')
        .map(s => (s as any).settings.module as number);
      const nextModule = (modules.length > 0 ? Math.max(...modules) : 0) + 1;

      // Determine insert orders (before thank_you if it exists)
      let insertOrder = maxOrder + 1;
      if (thank) {
        insertOrder = (thank.step_order || maxOrder + 1);
      }
      const contentOrder = insertOrder;
      const quizOrder = insertOrder + 1;

      // Shift thank_you to end if present
      if (thank) {
        await supabase
          .from('flow_steps')
          .update({ step_order: quizOrder + 1 })
          .eq('id', thank.id);
      }

      // Insert content step
      const { error: contentErr } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flowId,
          step_order: contentOrder,
          step_type: 'content',
          title: `Module ${nextModule}: Lesson`,
          subtitle: 'Read this short lesson before taking the quiz',
          content: `<p>This is the lesson content for Module ${nextModule}. You can edit this text in the editor.</p>`,
          is_required: true,
          settings: { module: nextModule }
        });
      if (contentErr) throw contentErr;

      // Insert quiz step
      const { data: quizStep, error: quizErr } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flowId,
          step_order: quizOrder,
          step_type: 'quiz',
          title: `Module ${nextModule} Quiz`,
          subtitle: 'Answer to continue',
          is_required: true,
          settings: { module: nextModule, allowRetake: true }
        })
        .select()
        .single();
      if (quizErr || !quizStep) throw quizErr || new Error('Failed to create quiz step');

      const { error: fieldErr } = await supabase.from('flow_fields').insert({
        step_id: quizStep.id,
        field_order: 1,
        field_type: 'radio',
        field_name: `module${nextModule}_q1`,
        label: `Module ${nextModule} sample question`,
        is_required: true,
        options: [
          { value: 'a', label: 'Correct answer', correct: true },
          { value: 'b', label: 'Wrong answer' },
          { value: 'c', label: 'Wrong answer' },
        ]
      });
      if (fieldErr) throw fieldErr;

      toast({ title: 'Module added', description: `Module ${nextModule} (lesson + quiz) created.` });
    } catch (e: any) {
      console.error('Add module failed', e);
      toast({ title: 'Error', description: e?.message || 'Could not add module', variant: 'destructive' });
    }
  };

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
        stepsPreset,
        customSteps: useCustomSteps ? [
          { number: 1, description: step1Text, color: '#10B981' },
          { number: 2, description: step2Text, color: '#F59E0B' },
          { number: 3, description: step3Text, color: '#3B82F6' },
        ] : [],
        benefitPreset,
        benefitsTitle,
        customBenefits: useCustomBenefits ? benefitsMultiline.split('\n').map(s => s.trim()).filter(Boolean) : [],
        trustBadgePreset: 'standard',
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Left: Basics */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Flow</CardTitle>
                <div className="flex gap-2 text-sm">
                  <Button type="button" variant={currentStep===0? 'default':'outline'} size="sm" onClick={()=>setCurrentStep(0)}>1. Basic</Button>
                  <Button type="button" variant={currentStep===1? 'default':'outline'} size="sm" onClick={()=>setCurrentStep(1)}>2. Content</Button>
                  <Button type="button" variant={currentStep===2? 'default':'outline'} size="sm" onClick={()=>setCurrentStep(2)}>3. Review</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep === 0 && (
              <>
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

                <div>
                  <Label>Theme Presets</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[...themePresets, ...dbThemes.map(t=>({ id: t.slug, name: t.name, primary: t.data?.primaryColor || '#3B82F6', button: t.data?.buttonColor || '#3B82F6', hero: heroImage }))].map(p => (
                      <Button key={p.id} type="button" variant="outline" size="sm" onClick={()=>applyTheme(p.id)}>{p.name}</Button>
                    ))}
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

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={()=>setCurrentStep(1)}>Next</Button>
                </div>
              </>
              )}

              {currentStep === 1 && (
                <>
                  <div className="space-y-3">
                    <Label>Field Bundles</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={()=>applyBundle('minimal')}>Minimal</Button>
                      <Button type="button" variant="outline" size="sm" onClick={()=>applyBundle('leadgen')}>Lead Gen</Button>
                      {dbBundles.map(b => (
                        <Button key={b.slug} type="button" variant="outline" size="sm" onClick={()=>{
                          const fields: string[] = b.data?.fields || [];
                          setIncludeFirstName(fields.includes('firstName'));
                          setIncludeLastName(fields.includes('lastName'));
                          setIncludeEmail(fields.includes('email'));
                          setIncludeZip(fields.includes('zipCode') || fields.includes('zip'));
                          setIncludeConsent(fields.includes('consent'));
                        }}>{b.name}</Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <Label>Steps Preset</Label>
                      <Select value={stepsPreset} onValueChange={(v:any)=>setStepsPreset(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="section8Housing">Section 8 Housing</SelectItem>
                          <SelectItem value="generalApplication">General Application</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Benefits Preset</Label>
                      <Select value={benefitPreset} onValueChange={(v:any)=>setBenefitPreset(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="section8">Section 8</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={useCustomSteps} onCheckedChange={(v)=>setUseCustomSteps(!!v)} />
                      Customize steps text
                    </label>
                    {useCustomSteps && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                          <Label>Step 1</Label>
                          <Input value={step1Text} onChange={(e)=>setStep1Text(e.target.value)} placeholder="Describe step 1" />
                        </div>
                        <div>
                          <Label>Step 2</Label>
                          <Input value={step2Text} onChange={(e)=>setStep2Text(e.target.value)} placeholder="Describe step 2" />
                        </div>
                        <div>
                          <Label>Step 3</Label>
                          <Input value={step3Text} onChange={(e)=>setStep3Text(e.target.value)} placeholder="Describe step 3" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={useCustomBenefits} onCheckedChange={(v)=>setUseCustomBenefits(!!v)} />
                      Customize benefits list
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label>Benefits Title</Label>
                        <Input value={benefitsTitle} onChange={(e)=>setBenefitsTitle(e.target.value)} />
                      </div>
                      <div>
                        <Label>Benefits (one per line)</Label>
                        <textarea className="w-full h-28 border rounded-md p-2 text-sm" value={benefitsMultiline} onChange={(e)=>setBenefitsMultiline(e.target.value)} placeholder="Item one\nItem two\nItem three" />
                      </div>
                    </div>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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

                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={includeUTMs} onCheckedChange={(v)=>setIncludeUTMs(!!v)} />
                      Capture UTM fields (adds hidden fields; also recorded on leads)
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={isGuide} onCheckedChange={(v)=>setIsGuide(!!v)} />
                      Create as Guide (adds Module 1 lesson + quiz, 70% pass threshold)
                    </label>
                  </div>

                  <div className="flex justify-between gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={()=>setCurrentStep(0)}>Back</Button>
                    <Button type="button" onClick={()=>setCurrentStep(2)}>Next</Button>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="text-sm text-gray-600">
                    Review your selections on the right. When ready, create your flow.
                  </div>
                  <div className="flex justify-between gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={()=>setCurrentStep(1)}>Back</Button>
                    <div className="flex gap-2">
                      {isEdit ? (
                        <Button onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                      ) : (
                        <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Flow'}</Button>
                      )}
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* Right: Fields and Preview */}
          <div className="space-y-4 lg:col-span-7">
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

            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Guide Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Add a new module (lesson + quiz). It will be inserted before the Thank You step.
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={handleAddModule}>Add Module</Button>
                      <Button type="button" variant="ghost" onClick={async()=>{ await handleAddModule(); await handleAddModule(); }}>Add 2 Modules</Button>
                    <Button type="button" variant="secondary" onClick={()=>setQbOpen(true)}>Question Bank</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <div className={`border rounded-lg overflow-hidden ${previewDevice === 'mobile' ? 'max-w-[420px]' : 'max-w-[1200px]'} mx-auto`}>
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
                          stepsPreset,
                          customSteps: useCustomSteps ? [
                            { number: 1, description: step1Text, color: '#10B981' },
                            { number: 2, description: step2Text, color: '#F59E0B' },
                            { number: 3, description: step3Text, color: '#3B82F6' },
                          ] : [],
                          benefitPreset,
                          benefitsTitle,
                          customBenefits: useCustomBenefits ? benefitsMultiline.split('\n').map(s => s.trim()).filter(Boolean) : [],
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
      {/* Simple Question Bank Dialog */}
      <Dialog open={qbOpen} onOpenChange={setQbOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Bank</DialogTitle>
            <DialogDescription>Insert pre-made quiz questions into the selected module.</DialogDescription>
          </DialogHeader>
          <div className="mb-3">
            <Button
              type="button"
              variant="outline"
              onClick={async()=>{
                setQbLoading(true);
                const { data, error } = await supabase.from('question_bank').select('*').limit(100);
                if (!error) setQbItems(data as any);
                setQbLoading(false);
              }}
            >
              {qbLoading ? 'Loading…' : 'Load Questions'}
            </Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {qbItems.map(q => (
              <div key={q.id} className="border rounded p-3">
                <div className="font-medium mb-2">{q.question_text}</div>
                <div className="text-xs text-gray-600 mb-2">{Array.isArray(q.options) ? `${q.options.length} options` : ''}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async()=>{
                    if (!flowId) return;
                    // Find latest module quiz step
                    const { data: steps } = await supabase.from('flow_steps').select('id, settings').eq('flow_id', flowId).order('step_order');
                    const lastQuiz = (steps||[]).reverse().find(s => (s as any).settings?.module);
                    if (!lastQuiz) return;
                    await supabase.from('flow_fields').insert({
                      step_id: (lastQuiz as any).id,
                      field_order: 99,
                      field_type: 'radio',
                      field_name: `qb_${Date.now()}`,
                      label: q.question_text,
                      is_required: true,
                      options: q.options
                    });
                    toast({ title: 'Added question', description: 'Inserted into the latest module quiz.' });
                  }}
                >
                  Insert into latest module
                </Button>
              </div>
            ))}
            {qbItems.length === 0 && !qbLoading && (
              <div className="text-sm text-gray-600">No questions loaded yet. Click "Load Questions".</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}


