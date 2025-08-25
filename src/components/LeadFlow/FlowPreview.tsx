import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowPayload } from '@/types/flowSchema';
import { StepRegistry } from '@/components/LeadFlow/stepRegistry';

interface FlowPreviewProps {
  flow: FlowPayload;
  className?: string;
}

export default function FlowPreview({ flow, className }: FlowPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const currentStep = flow.steps[currentStepIndex];
  const stepMeta = currentStep ? StepRegistry[currentStep.step_type] : null;
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < flow.steps.length - 1;
  const progress = flow.steps.length > 1 ? ((currentStepIndex + 1) / flow.steps.length) * 100 : 100;

  const handleStepComplete = (data: Record<string, any>) => {
    setResponses(prev => ({ ...prev, ...data }));
    if (canGoForward) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  if (!currentStep || !stepMeta) {
    return (
      <div className={`p-8 ${className}`}>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Steps to Preview</h3>
              <p className="text-sm">Add some steps to your flow to see the preview.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`} style={{ 
      backgroundColor: flow.style_config.backgroundColor,
      fontFamily: flow.style_config.fontFamily 
    }}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              PREVIEW MODE
            </Badge>
            <span className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {flow.steps.length}
            </span>
            {flow.settings?.showProgress && flow.steps.length > 1 && (
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`, 
                    backgroundColor: flow.style_config.primaryColor 
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={!canGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForward}
              disabled={!canGoForward}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/flow/${flow.slug}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Live Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="py-8 px-4">
        <div className={`mx-auto ${
          flow.style_config.layout === 'centered' ? 'max-w-2xl' :
          flow.style_config.layout === 'split' ? 'max-w-6xl' : 'max-w-full'
        }`}>
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Step Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{stepMeta.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentStep.title}
                    </h2>
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

              {/* Step Component */}
              <div className="mb-6">
                <stepMeta.Renderer
                  step={currentStep}
                  values={responses}
                  onComplete={handleStepComplete}
                  styleConfig={flow.style_config}
                  isSubmitting={false}
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="text-sm text-gray-500">
                  {stepMeta.displayName}
                </div>
                
                <div className="flex gap-3">
                  {canGoBack && flow.settings?.allowBack && (
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  <Button
                    style={{ backgroundColor: flow.style_config.primaryColor }}
                    onClick={() => handleStepComplete(responses)}
                    className={`text-white border-0 ${
                      flow.style_config.buttonStyle === 'pill' ? 'rounded-full' :
                      flow.style_config.buttonStyle === 'square' ? 'rounded-none' : 'rounded-lg'
                    }`}
                  >
                    {currentStep.button_text || 'Continue'}
                    {canGoForward && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-3 max-w-sm">
        <div className="text-xs font-medium text-gray-700 mb-2">Debug Info</div>
        <div className="text-xs space-y-1">
          <div><strong>Flow:</strong> {flow.name}</div>
          <div><strong>Step:</strong> {currentStep.step_type}</div>
          <div><strong>Layout:</strong> {flow.style_config.layout}</div>
          <div><strong>Responses:</strong> {Object.keys(responses).length}</div>
        </div>
      </div>
    </div>
  );
}
