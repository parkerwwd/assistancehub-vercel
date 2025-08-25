import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadSession } from '@/types/leadFlow';
import { FlowService } from '@/services/flowService';
import { FlowPayload, FlowPayloadStep } from '@/types/flowSchema';
import { StepRegistry } from '@/components/LeadFlow/stepRegistry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

// Error handling component
interface FlowErrorProps {
  error: string;
  details?: string[];
  onRetry?: () => Promise<void>;
  slug?: string;
}

function FlowError({ error, details, onRetry, slug }: FlowErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry?.();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Flow Not Available
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {details && details.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {slug && (
              <div className="text-sm text-gray-500 mb-4">
                Flow slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
              </div>
            )}
          </div>
          
          {onRetry && (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component
function FlowLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading flow...</p>
      </div>
    </div>
  );
}

// Main enhanced flow renderer
export default function EnhancedFlowRenderer() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  
  // Enhanced state management with proper types
  const [flow, setFlow] = useState<FlowPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string[] } | null>(null);
  const [session, setSession] = useState<LeadSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track analytics and UTM parameters
  const trackFlowView = useCallback(async (flowId: string) => {
    try {
      // Increment view count
      await supabase
        .from('flows')
        .update({ total_views: supabase.sql`total_views + 1` })
        .eq('id', flowId);
        
      console.log('📊 Flow view tracked:', flowId);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, []);

  // Initialize session with UTM parameters  
  const initializeSession = useCallback(() => {
    if (!flow) return;

    const newSession: LeadSession = {
      flowId: flow.id || 'unknown',
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
    trackFlowView(newSession.flowId);
    
    console.log('✅ Session initialized:', newSession);
  }, [flow, searchParams, trackFlowView]);

  // Load flow with enhanced error handling
  const loadFlow = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading flow:', slug);
      
      const result = await FlowService.getPublishedBySlug(slug);
      
      if (!result.success) {
        throw new Error(result.errors?.[0] || 'Failed to load flow');
      }
      
      if (!result.data) {
        throw new Error('No flow data received');
      }

      const { payload } = result.data;
      
      // Validate that flow has steps
      if (!payload.steps || payload.steps.length === 0) {
        throw new Error('Flow has no steps defined');
      }

      // Validate each step using registry
      const validationErrors: string[] = [];
      payload.steps.forEach((step, index) => {
        const stepMeta = StepRegistry[step.step_type];
        if (!stepMeta) {
          validationErrors.push(`Step ${index + 1}: Unknown step type '${step.step_type}'`);
          return;
        }
        
        const stepValidation = stepMeta.validate(step);
        if (!stepValidation.isValid) {
          validationErrors.push(...stepValidation.errors.map(err => `Step ${index + 1}: ${err}`));
        }
      });
      
      if (validationErrors.length > 0) {
        setError({
          message: 'Flow contains validation errors',
          details: validationErrors
        });
        setLoading(false);
        return;
      }

      setFlow(payload);
      console.log('✅ Flow loaded successfully:', payload.name);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to load flow:', errorMessage);
      
      setError({
        message: errorMessage,
        details: [
          `Slug: ${slug}`,
          'Check if the flow exists and is published',
          'Verify the URL is correct'
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initialize flow on mount and slug change
  useEffect(() => {
    loadFlow();
  }, [loadFlow]);
  
  // Initialize session when flow loads
  useEffect(() => {
    if (flow && !session) {
      initializeSession();
    }
  }, [flow, session, initializeSession]);

  // Step navigation handlers
  const handleStepComplete = useCallback(async (stepData: Record<string, any>) => {
    if (!flow || !session) return;

    const newResponses = { ...responses, ...stepData };
    setResponses(newResponses);

    // If this is the last step, submit the lead
    if (currentStepIndex === flow.steps.length - 1) {
      setIsSubmitting(true);
      try {
        // Create lead record
        const leadData = {
          flow_id: session.flowId,
          email: newResponses.email || null,
          phone: newResponses.phone || null,
          first_name: newResponses.firstName || newResponses.first_name || null,
          last_name: newResponses.lastName || newResponses.last_name || null,
          zip_code: newResponses.zip || newResponses.zipCode || null,
          utm_source: session.utmParams?.source,
          utm_medium: session.utmParams?.medium,
          utm_campaign: session.utmParams?.campaign,
          utm_term: session.utmParams?.term,
          utm_content: session.utmParams?.content,
          gclid: session.gclid,
          metadata: newResponses,
          status: 'new',
          completed_at: new Date().toISOString(),
          time_to_complete: Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000)
        };

        const { error: leadError } = await supabase
          .from('leads')
          .insert(leadData);

        if (leadError) throw leadError;

        // Track completion
        await supabase
          .from('flows')
          .update({ total_completions: supabase.sql`total_completions + 1` })
          .eq('id', session.flowId);

        console.log('✅ Lead submitted successfully');
        toast({
          title: "Success!",
          description: "Your information has been submitted."
        });

      } catch (error) {
        console.error('❌ Failed to submit lead:', error);
        toast({
          title: "Submission Error",
          description: "There was a problem submitting your information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [flow, session, responses, currentStepIndex]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Render logic with proper error handling
  if (loading) {
    return <FlowLoading />;
  }

  if (error) {
    return (
      <FlowError
        error={error.message}
        details={error.details}
        onRetry={loadFlow}
        slug={slug}
      />
    );
  }

  if (!flow || !session) {
    return (
      <FlowError
        error="Flow not available"
        details={['Flow data is missing', 'Please try refreshing the page']}
        onRetry={loadFlow}
        slug={slug}
      />
    );
  }

  const currentStep = flow.steps[currentStepIndex];
  const stepMeta = StepRegistry[currentStep.step_type];
  const progress = ((currentStepIndex + 1) / flow.steps.length) * 100;
  const canGoBack = currentStepIndex > 0 && flow.settings?.allowBack;

  if (!stepMeta) {
    return (
      <FlowError
        error={`Unknown step type: ${currentStep.step_type}`}
        details={[`Step ${currentStepIndex + 1} has an invalid type`]}
        onRetry={loadFlow}
        slug={slug}
      />
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: flow.style_config.backgroundColor,
        fontFamily: flow.style_config.fontFamily 
      }}
    >
      {/* Progress bar */}
      {flow.settings?.showProgress && flow.steps.length > 1 && (
        <div className="w-full bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 min-w-0">
                Step {currentStepIndex + 1} of {flow.steps.length}
              </span>
              <Progress 
                value={progress} 
                className="flex-1"
                style={{ 
                  accentColor: flow.style_config.primaryColor 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`w-full ${
          flow.style_config.layout === 'centered' ? 'max-w-2xl' :
          flow.style_config.layout === 'split' ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8' :
          'max-w-full'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`shadow-xl ${
                flow.style_config.shadowLevel === 'none' ? 'shadow-none' :
                flow.style_config.shadowLevel === 'sm' ? 'shadow-sm' :
                flow.style_config.shadowLevel === 'lg' ? 'shadow-2xl' :
                flow.style_config.shadowLevel === 'xl' ? 'shadow-3xl' : 
                'shadow-xl'
              }`} style={{ borderRadius: flow.style_config.borderRadius }}>
                <CardContent className="p-8">
                  {/* Step header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{stepMeta.icon}</span>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {currentStep.title}
                        </h1>
                        {currentStep.subtitle && (
                          <p className="text-gray-600 mt-1">
                            {currentStep.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {currentStep.content && (
                      <div className="prose text-gray-700 mb-4">
                        {currentStep.content}
                      </div>
                    )}
                  </div>

                  {/* Step component */}
                  <div className="mb-6">
                    <stepMeta.Renderer
                      step={currentStep}
                      values={responses}
                      onComplete={handleStepComplete}
                      styleConfig={flow.style_config}
                      isSubmitting={isSubmitting}
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <div className="text-sm text-gray-500">
                      {stepMeta.displayName}
                    </div>
                    
                    <div className="flex gap-3">
                      {canGoBack && (
                        <Button variant="outline" onClick={handleBack}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleStepComplete(responses)}
                        disabled={isSubmitting}
                        style={{ backgroundColor: flow.style_config.primaryColor }}
                        className={`text-white border-0 ${
                          flow.style_config.buttonStyle === 'pill' ? 'rounded-full' :
                          flow.style_config.buttonStyle === 'square' ? 'rounded-none' : 'rounded-lg'
                        }`}
                      >
                        {isSubmitting ? 'Submitting...' : currentStep.button_text || 'Continue'}
                        {currentStepIndex < flow.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
