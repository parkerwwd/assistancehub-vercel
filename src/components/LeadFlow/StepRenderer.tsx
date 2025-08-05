import React, { useState } from 'react';
import { FlowStepWithFields, FieldValues, StepType } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import FormStep from './steps/FormStep';
import ContentStep from './steps/ContentStep';
import QuizStep from './steps/QuizStep';
import ThankYouStep from './steps/ThankYouStep';
import InteractiveLocationPicker from './steps/InteractiveLocationPicker';
import SinglePageLandingStep from './steps/SinglePageLandingStep';

interface StepRendererProps {
  step: FlowStepWithFields;
  onComplete: (data: FieldValues) => void;
  onBack?: () => void;
  values: FieldValues;
  isSubmitting?: boolean;
  styleConfig?: any;
}

export default function StepRenderer({
  step,
  onComplete,
  onBack,
  values,
  isSubmitting,
  styleConfig
}: StepRendererProps) {
  const [stepValues, setStepValues] = useState<FieldValues>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setStepValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = () => {
    onComplete(stepValues);
  };

  const renderStepContent = () => {
    // Check for special interactive steps first
    if (step.step_type === 'form' && step.fields?.some(f => f.field_type === 'zip')) {
      // If it's a location-based form, use interactive picker
      const hasOnlyLocation = step.fields.length === 1 && step.fields[0].field_type === 'zip';
      if (hasOnlyLocation) {
        return (
          <InteractiveLocationPicker
            step={step}
            onChange={handleFieldChange}
            values={stepValues}
            onSubmit={handleSubmit}
            styleConfig={styleConfig}
          />
        );
      }
    }

    // Regular step types
    switch (step.step_type) {
      case StepType.FORM:
        return (
          <FormStep
            step={step}
            onChange={handleFieldChange}
            values={stepValues}
            existingValues={values}
          />
        );
      
      case StepType.CONTENT:
        return (
          <ContentStep
            step={step}
            styleConfig={styleConfig}
          />
        );
      
      case StepType.QUIZ:
        return (
          <QuizStep
            step={step}
            onChange={handleFieldChange}
            values={stepValues}
            onComplete={handleSubmit}
          />
        );
      
      case StepType.THANK_YOU:
        return (
          <ThankYouStep
            step={step}
            responses={values}
            styleConfig={styleConfig}
          />
        );
      
      case StepType.SINGLE_PAGE_LANDING:
        return (
          <SinglePageLandingStep
            step={step}
            onChange={handleFieldChange}
            values={stepValues}
            onComplete={handleSubmit}
            styleConfig={styleConfig}
          />
        );
      
      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (step.step_type === StepType.FORM) {
      // Check required fields
      const requiredFields = step.fields?.filter(f => f.is_required) || [];
      return requiredFields.every(field => {
        const value = stepValues[field.field_name];
        return value !== undefined && value !== '' && value !== null;
      });
    }
    return true;
  };

  const showNavigationButtons = step.step_type !== StepType.QUIZ && 
    step.step_type !== StepType.THANK_YOU && 
    step.step_type !== StepType.SINGLE_PAGE_LANDING;

  return (
    <div className="space-y-6">
      {/* Step header - skip for single page landing as it handles its own layout */}
      {step.step_type !== StepType.SINGLE_PAGE_LANDING && (
        <div className="text-center space-y-2">
          {step.title && (
            <h2 className="text-3xl font-bold text-gray-900">
              {step.title}
            </h2>
          )}
          {step.subtitle && (
            <p className="text-lg text-gray-600">
              {step.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Step content */}
      <div className={step.step_type === StepType.SINGLE_PAGE_LANDING ? "" : "mt-8"}>
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      {showNavigationButtons && (
        <div className={`mt-8 max-w-md mx-auto ${
          onBack ? 'flex justify-between items-center' : 'text-center'
        }`}>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`flex items-center gap-2 font-bold text-lg py-6 px-8 ${
              onBack ? 'min-w-[150px]' : 'min-w-[250px] mx-auto'
            } hover:shadow-lg transition-all`}
            style={{
              backgroundColor: styleConfig?.primaryColor || undefined,
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {step.button_text || 'Continue'}
                {step.step_type === StepType.FORM && step.fields?.length === 1 && (
                  <Sparkles className="w-4 h-4" />
                )}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}