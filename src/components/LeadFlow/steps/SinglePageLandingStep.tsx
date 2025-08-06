import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlowStepWithFields, FieldValues } from '@/types/leadFlow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';
import HeroSplitLayout from '../layouts/HeroSplitLayout';
import NumberedSteps, { presetSteps } from '../components/NumberedSteps';
import TrustBadges, { presetTrustBadges } from '../components/TrustBadges';
import BenefitsList, { presetBenefits } from '../components/BenefitsList';

interface SinglePageLandingStepProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: FieldValues;
  onComplete: () => void;
  styleConfig?: any;
}

export default function SinglePageLandingStep({
  step,
  onChange,
  values,
  onComplete,
  styleConfig
}: SinglePageLandingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Extract configuration from step
  const config = step.settings || {};
  const {
    heroImage,
    logo,
    trustBadgePreset = 'standard',
    customTrustBadges = [],
    benefitPreset = 'section8',
    customBenefits = [],
    stepsPreset = 'section8Housing',
    customSteps = [],
    formLayout = 'stacked', // 'stacked' or 'grid'
    buttonText = 'Download Application Guide',
    buttonColor = '#3B82F6',
    showProgressSteps = true,
    showBenefits = true,
    benefitsTitle = 'What Do I Get When Signing Up?',
    layoutType = 'centered', // 'centered' or 'heroSplit'
    primaryColor = '#1E40AF',
    accentColor = '#10B981'
  } = config;

  // Get preset data or use custom
  const trustBadges = customTrustBadges.length > 0 
    ? customTrustBadges 
    : presetTrustBadges[trustBadgePreset as keyof typeof presetTrustBadges] || presetTrustBadges.standard;
  
  const benefits = customBenefits.length > 0 
    ? customBenefits 
    : presetBenefits[benefitPreset as keyof typeof presetBenefits] || presetBenefits.section8;
    
  const stepDescriptions = customSteps.length > 0 
    ? customSteps 
    : presetSteps[stepsPreset as keyof typeof presetSteps] || presetSteps.section8Housing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    step.fields?.forEach(field => {
      if (field.is_required && !values[field.field_name]) {
        newErrors[field.field_name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete();
  };

  const renderField = (field: any) => {
    const error = errors[field.field_name];
    
    return (
      <motion.div
        key={field.id || field.tempId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={formLayout === 'grid' ? 'col-span-1' : ''}
      >
        <Input
          type={field.field_type}
          placeholder={field.placeholder || field.label}
          value={values[field.field_name] || ''}
          onChange={(e) => {
            onChange(field.field_name, e.target.value);
            if (errors[field.field_name]) {
              setErrors(prev => ({ ...prev, [field.field_name]: '' }));
            }
          }}
          className={`
            w-full px-4 py-3 text-base border-2 rounded-lg
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:border-blue-500 focus:outline-none
            transition-colors
          `}
          style={{
            borderColor: error ? undefined : styleConfig?.primaryColor
          }}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </motion.div>
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form Title if different from main title */}
      {step.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.title}
        </h2>
      )}

      {/* Form Subtitle */}
      {step.subtitle && (
        <p className="text-gray-600 mb-6">
          {step.subtitle}
        </p>
      )}

      {/* Form Fields */}
      <div className={
        formLayout === 'grid' 
          ? 'grid grid-cols-2 gap-4' 
          : 'space-y-4'
      }>
        {step.fields?.map(renderField)}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
        style={{
          backgroundColor: buttonColor,
          color: '#FFFFFF'
        }}
      >
        {buttonText}
      </Button>

      {/* Trust Badges */}
      {trustBadges.length > 0 && (
        <div className="mt-4">
          <TrustBadges 
            badges={trustBadges} 
            layout="horizontal"
            size="sm"
          />
        </div>
      )}

      {/* Legal Text */}
      {step.content && (
        <div 
          className="text-xs text-gray-500 mt-4"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}
    </form>
  );

  // If using the split layout
  if (config.layoutType === 'heroSplit') {
    return (
      <HeroSplitLayout
        flow={{ 
          ...step, 
          name: step.title || '', 
          description: step.subtitle 
        } as any}
        heroImage={heroImage}
        logo={logo}
        trustBadges={trustBadges}
        benefits={benefits}
        stepDescriptions={stepDescriptions}
      >
        {formContent}
      </HeroSplitLayout>
    );
  }

  // Default centered layout
  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Form Card - Moved to top for better conversion */}
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        {formContent}
      </div>

      {/* Logo */}
      {logo && (
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-20 mx-auto" />
        </div>
      )}

      {/* Hero Image */}
      {heroImage && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img src={heroImage} alt="Hero" className="w-full h-auto" />
        </div>
      )}

      {/* Progress Steps */}
      {showProgressSteps && stepDescriptions.length > 0 && (
        <div className="mt-8">
          <NumberedSteps 
            steps={stepDescriptions}
            layout="vertical"
            animated={true}
            className="bg-white rounded-lg shadow-lg p-6"
          />
        </div>
      )}

      {/* Benefits Section */}
      {showBenefits && benefits.length > 0 && (
        <div className="mt-8">
          <BenefitsList 
            benefits={benefits}
            title={benefitsTitle}
            layout="double"
            checkmarkColor={accentColor}
            animated={true}
          />
        </div>
      )}
    </div>
  );
}