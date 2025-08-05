import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowWithSteps, LeadSession, FieldValues } from '@/types/leadFlow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import StepRenderer from './StepRenderer';
import FlowProgress from './FlowProgress';
import { Shield, Lock } from 'lucide-react';
import '@/styles/lead-flow-custom.css';
import '@/styles/section8-form.css';
import '@/styles/affordable-heroes-flow.css';

export default function FlowRenderer() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [flow, setFlow] = useState<FlowWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LeadSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize session with UTM parameters
  useEffect(() => {
    if (flow && flow.steps && flow.steps.length > 0) {
      console.log('Initializing session for flow:', flow.name, 'with', flow.steps.length, 'steps');
      const newSession: LeadSession = {
        flowId: flow.id,
        currentStep: 0,
        responses: {},
        startedAt: new Date(),
        utmParams: {
          source: searchParams.get('utm_source') || undefined,
          medium: searchParams.get('utm_medium') || undefined,
          campaign: searchParams.get('utm_campaign') || undefined,
          term: searchParams.get('utm_term') || undefined,
          content: searchParams.get('utm_content') || undefined,
        },
        gclid: searchParams.get('gclid') || undefined,
      };
      setSession(newSession);
      
      // Track flow view
      trackFlowView(flow.id, flow.status);
      
      // Show preview banner for non-active flows
      if (flow.status !== 'active') {
        console.log('🔍 Previewing', flow.status, 'flow:', flow.name);
      }
    }
  }, [flow, searchParams]);

  // Load flow data
  useEffect(() => {
    loadFlow();
  }, [slug]);

  const loadFlow = async (retryCount = 0) => {
    if (!slug) return;

    let hasError = false;
    
    try {
      console.log(`Loading flow: ${slug} (attempt ${retryCount + 1})`);
      
      // Fetch flow with steps and fields
      const { data: flowData, error: flowError } = await supabase
        .from('flows')
        .select(`
          *,
          steps:flow_steps(
            *,
            fields:flow_fields(*)
          )
        `)
        .eq('slug', slug)
        .single();

      if (flowError) {
        hasError = true;
        throw flowError;
      }

      // Sort steps and fields by order
      if (flowData) {
        console.log('Flow loaded:', flowData.name, 'Steps:', flowData.steps?.length || 0);
        console.log('Flow data structure:', {
          hasSteps: 'steps' in flowData,
          stepsType: typeof flowData.steps,
          stepsIsArray: Array.isArray(flowData.steps),
          rawData: JSON.stringify(flowData).substring(0, 200) + '...'
        });
        
        // Ensure steps is an array - handle various edge cases
        if (!flowData.steps || !Array.isArray(flowData.steps)) {
          console.warn('Steps not found or not an array, initializing empty array');
          flowData.steps = [];
        }
        
        // Sort if we have steps
        if (flowData.steps.length > 0) {
          flowData.steps.sort((a, b) => a.step_order - b.step_order);
          flowData.steps.forEach(step => {
            if (step.fields && Array.isArray(step.fields)) {
              step.fields.sort((a, b) => a.field_order - b.field_order);
            }
          });
        }
        
        setFlow(flowData as FlowWithSteps);
      }
    } catch (error: any) {
      hasError = true;
      console.error('Error loading flow:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        userAgent: navigator.userAgent
      });
      
      // Retry on mobile if network error
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isNetworkError = error?.message?.includes('network') || 
                            error?.message?.includes('fetch') || 
                            error?.code === 'PGRST301'; // Supabase timeout
      
      if (isMobile && isNetworkError && retryCount < 2) {
        console.log(`Retrying flow load on mobile (attempt ${retryCount + 2})...`);
        setTimeout(() => loadFlow(retryCount + 1), 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: error?.message || "Could not load the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Set loading false if we're done with retries or succeeded
      if (!hasError || retryCount >= 2) {
        setLoading(false);
      }
    }
  };

  const trackFlowView = async (flowId: string, status: string) => {
    try {
      // Only track views for active flows
      if (status === 'active') {
        await supabase.rpc('increment_flow_views', { flow_slug: slug });
      }
    } catch (error) {
      console.error('Error tracking flow view:', error);
    }
  };

  const handleStepComplete = async (stepData: FieldValues) => {
    if (!session || !flow) return;

    // Update session responses
    const updatedSession = {
      ...session,
      responses: { ...session.responses, ...stepData },
    };
    setSession(updatedSession);

    // Check if this is the last step
    const currentStep = flow.steps[session.currentStep];
    const isLastStep = session.currentStep >= flow.steps.length - 1;

    if (isLastStep || currentStep?.step_type === 'thank_you') {
      // Submit lead
      await submitLead(updatedSession);
    } else {
      // Move to next step (considering navigation logic)
      const nextStepIndex = determineNextStep(currentStep, stepData);
      setSession({
        ...updatedSession,
        currentStep: nextStepIndex,
      });
    }
  };

  const determineNextStep = (currentStep: any, responses: FieldValues): number => {
    // Check navigation logic
    if (currentStep?.navigation_logic?.conditions) {
      for (const logic of currentStep.navigation_logic.conditions) {
        if (evaluateCondition(logic, responses)) {
          return logic.targetStep || session!.currentStep + 1;
        }
      }
    }
    
    // Default: next step
    return session!.currentStep + 1;
  };

  const evaluateCondition = (condition: any, responses: FieldValues): boolean => {
    const fieldValue = responses[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'contains':
        return fieldValue?.includes(condition.value);
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  };

  const submitLead = async (finalSession: LeadSession) => {
    setIsSubmitting(true);
    
    try {
      // Create lead record
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          flow_id: finalSession.flowId,
          email: finalSession.responses.email,
          phone: finalSession.responses.phone,
          first_name: finalSession.responses.firstName || finalSession.responses.first_name,
          last_name: finalSession.responses.lastName || finalSession.responses.last_name,
          zip_code: finalSession.responses.zipCode || finalSession.responses.zip_code || finalSession.responses.zip,
          utm_source: finalSession.utmParams?.source,
          utm_medium: finalSession.utmParams?.medium,
          utm_campaign: finalSession.utmParams?.campaign,
          utm_term: finalSession.utmParams?.term,
          utm_content: finalSession.utmParams?.content,
          gclid: finalSession.gclid,
          user_agent: navigator.userAgent,
          time_to_complete: Math.floor((new Date().getTime() - finalSession.startedAt.getTime()) / 1000),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Save individual field responses
      const responses = Object.entries(finalSession.responses).map(([fieldName, fieldValue]) => ({
        lead_id: lead.id,
        field_name: fieldName,
        field_value: String(fieldValue),
      }));

      if (responses.length > 0) {
        const { error: responseError } = await supabase
          .from('lead_responses')
          .insert(responses);

        if (responseError) throw responseError;
      }

      // Track conversion
      if (window.gtag && flow?.google_ads_config?.conversionId) {
        window.gtag('event', 'conversion', {
          'send_to': `${flow.google_ads_config.conversionId}/${flow.google_ads_config.conversionLabel}`,
          'value': 1.0,
          'currency': 'USD',
        });
      }

      // Show thank you step or redirect
      if (flow && session) {
        const thankYouStep = flow.steps?.find(s => s.step_type === 'thank_you');
        if (thankYouStep) {
          setSession({
            ...finalSession,
            currentStep: flow.steps.indexOf(thankYouStep),
            leadId: lead.id,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error",
        description: "Could not submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (session && session.currentStep > 0) {
      setSession({
        ...session,
        currentStep: session.currentStep - 1,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!flow || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
          <p className="text-gray-600">This form may have been moved or is no longer available.</p>
        </div>
      </div>
    );
  }

  // Check if flow has steps
  if (!flow.steps || flow.steps.length === 0) {
    console.log('No steps found - flow:', flow?.name, 'steps:', flow?.steps);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Steps Configured</h1>
          <p className="text-gray-600">This form doesn't have any steps configured yet.</p>
          {/* Debug info - remove in production */}
          <p className="text-xs text-gray-400 mt-4">
            Debug: {flow?.name || 'No flow'} | Steps: {flow?.steps?.length || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  const currentStep = flow.steps[session.currentStep];
  const progress = ((session.currentStep + 1) / flow.steps.length) * 100;
  const styleConfig = flow.style_config as any || {};

  return (
    <div 
      className="min-h-screen flow-renderer"
      data-slug={flow.slug}
      style={{
        backgroundColor: styleConfig.backgroundColor || '#f8fafc',
        fontFamily: styleConfig.fontFamily || 'inherit',
      }}
    >
      {/* Preview Banner for non-active flows */}
      {flow.status !== 'active' && (
        <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-medium">
          🔍 Preview Mode - This flow is {flow.status} and not visible to the public
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with logo */}
        {styleConfig.logoUrl && (
          <div className="text-center mb-8">
            <img 
              src={styleConfig.logoUrl} 
              alt="Logo" 
              className="h-12 mx-auto"
            />
          </div>
        )}
        
        {/* Hero Image */}
        {styleConfig.heroImageUrl && (
          <div className="mb-8">
            <img 
              src={styleConfig.heroImageUrl} 
              alt="" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Progress bar */}
        <FlowProgress 
          current={session.currentStep + 1} 
          total={flow.steps.length}
          percentage={progress}
        />

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mt-8 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={session.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepRenderer
                step={currentStep}
                onComplete={handleStepComplete}
                onBack={session.currentStep > 0 ? handleBack : undefined}
                values={session.responses}
                isSubmitting={isSubmitting}
                styleConfig={styleConfig}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Your information is secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}