import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Tablet, Smartphone, RefreshCw, Maximize2, X } from 'lucide-react';
import './PreviewStyles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowWithSteps, LeadSession, FieldValues } from '@/types/leadFlow';
import StepRenderer from '../StepRenderer';

interface FlowPreviewProps {
  flow: FlowWithSteps;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function FlowPreview({ flow, isVisible, onClose, className = '' }: FlowPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<FieldValues>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock session for preview
  const mockSession: LeadSession = {
    flowId: flow.id || 'preview',
    currentStep,
    responses,
    startedAt: new Date(),
  };

  const deviceDimensions = {
    desktop: { width: '100%', height: '100%', maxWidth: 'none' },
    tablet: { width: '768px', height: '1024px', maxWidth: '768px' },
    mobile: { width: '375px', height: '667px', maxWidth: '375px' }
  };

  const handleStepComplete = (stepData: FieldValues) => {
    setResponses(prev => ({ ...prev, ...stepData }));
    if (currentStep < (flow.steps?.length || 1) - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetPreview = () => {
    setCurrentStep(0);
    setResponses({});
    setRefreshKey(prev => prev + 1);
  };

  // Reset preview when flow changes
  useEffect(() => {
    resetPreview();
  }, [flow.steps, flow.settings, flow.style_config]);

  if (!isVisible) return null;

  const currentStepData = flow.steps?.[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`
          ${isFullscreen 
            ? 'fixed inset-0 z-50 bg-white' 
            : 'relative h-full'
          }
          ${className}
        `}
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Live Preview
                </Badge>
                {flow.name || 'Untitled Flow'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Device Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('desktop')}
                  className="h-8 px-2"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('tablet')}
                  className="h-8 px-2"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('mobile')}
                  className="h-8 px-2"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {flow.steps?.length || 1}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPreview}
                  className="h-8 px-2"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-4 preview-panel">
            <div className="h-full flex items-center justify-center">
              <div className={`preview-device-frame ${device} relative`}>
                <div className="preview-live-indicator"></div>
                <motion.div
                  key={`${device}-${refreshKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`preview-content preview-device-${device}`}
                >
                  <div className="preview-scroll-container">
                    {currentStepData ? (
                      <div key={refreshKey} data-slug={flow.slug} className={device === 'mobile' ? 'text-sm' : ''}>
                        <StepRenderer
                          step={currentStepData}
                          onComplete={handleStepComplete}
                          onBack={currentStep > 0 ? handleStepBack : undefined}
                          values={responses}
                          styleConfig={flow.style_config}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 preview-loading">
                        <div className="text-center">
                          <p className="text-lg font-medium mb-2">No steps defined</p>
                          <p className="text-sm">Add a step to see the preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Step Navigation */}
            {flow.steps && flow.steps.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStepBack}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {flow.steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`
                        w-3 h-3 rounded-full transition-colors
                        ${index === currentStep 
                          ? 'bg-blue-600' 
                          : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }
                      `}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.min(currentStep + 1, (flow.steps?.length || 1) - 1))}
                  disabled={currentStep >= (flow.steps?.length || 1) - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}