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
    benefitsImageUrl,
    layoutType = 'centered', // 'centered', 'heroSplit', or 'formLeft'
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
        {step.fields && step.fields.length > 0 ? (
          step.fields.map(renderField)
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p>No form fields configured yet.</p>
            <p className="text-sm">Add fields in the flow editor to collect user information.</p>
          </div>
        )}
      </div>

      {/* Submit Button - Only show if there are fields */}
      {step.fields && step.fields.length > 0 && (
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
      )}

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

  // Form-left layout (new competitor style)
  if (config.layoutType === 'formLeft') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Logo */}
        {logo && (
          <div className="bg-white py-4 px-4 shadow-sm">
            <div className="max-w-7xl mx-auto">
              <img src={logo} alt="Logo" className="h-16" />
            </div>
          </div>
        )}
        
        {/* Hero Section - Form Left, Image Right */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Form */}
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2 uppercase">
                {step.title || 'APPLY HERE FOR:'}
              </h1>
              <h2 className="text-2xl text-gray-700 mb-4">
                {step.subtitle || 'SECTION 8 VOUCHERS GOVERNMENT HOUSING RENTAL ASSISTANCE AND MORE'}
              </h2>
              {step.content && (
                <p className="text-gray-600 mb-6">{step.content}</p>
              )}
              
              {/* Form */}
              <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
                {formContent}
              </div>
            </div>
            
            {/* Right Column - Image with Steps Overlay */}
            <div className="relative">
              {heroImage && (
                <img 
                  src={heroImage} 
                  alt="Happy family" 
                  className="rounded-lg w-full h-full object-cover"
                />
              )}
              
              {/* Steps Overlay */}
              {showProgressSteps && stepDescriptions.length > 0 && (
                <div className="lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-0 lg:-mr-16 xl:-mr-24 space-y-4 mt-8 lg:mt-0">
                  {stepDescriptions.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 bg-white/95 backdrop-blur rounded-lg p-4 lg:p-5 shadow-xl max-w-md lg:max-w-lg"
                    >
                      <div 
                        className="w-16 h-16 flex items-center justify-center text-white text-3xl font-bold rounded flex-shrink-0"
                        style={{ backgroundColor: step.color }}
                      >
                        {step.number}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
        
        {/* Benefits Section */}
        {showBenefits && benefits.length > 0 && (
          <div className="bg-white py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-8 lg:mb-12 text-center">
                {benefitsTitle}
              </h2>
              
              {/* Benefits List */}
              <div className="space-y-4 mb-12 lg:mb-16">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-base lg:text-lg">
                      {typeof benefit === 'string' ? benefit : benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  className="px-10 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  style={{
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF'
                  }}
                >
                  {buttonText}
                </Button>
                <p className="mt-4 text-sm text-gray-600">
                  🔒100% Secure and SPAM Free
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-gray-100 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs lg:text-sm text-gray-500 max-w-6xl mx-auto leading-relaxed">
            Finding Low Income Housing can be an overwhelming task for many. With so many options to choose from its difficult to decide which option is best for you and your family. Is it Section 8 Housing, Choice Housing Vouchers, Low Income Housing, Public Housing or Subsidized Housing programs? Each of these HUD Section 811 or Section 202 Housing options is catered specifically for the Affordable Housing Program applicants and different options and have the best program for you and your financial needs and provides you with a road map on how to qualify for these programs and what eligibility requirements are going to be necessary in order to get approved for one of these programs.
          </p>
        </div>
      </div>
    );
  }

  // Default centered layout (competitor style)
  return (
    <div className="min-h-screen">
      {/* Hero Section with Form Overlay */}
      <div 
        className="relative min-h-[600px] flex items-center justify-center py-12 px-4"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : 'linear-gradient(135deg, #0891b2 0%, #065f46 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Logo at top */}
          {logo && (
            <div className="text-center mb-8">
              <img src={logo} alt="Logo" className="h-20 mx-auto filter brightness-0 invert" />
            </div>
          )}
          
          {/* Hero Content */}
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {step.title || 'Apply Here For:'}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              {step.subtitle || 'Section 8 Vouchers Government Housing Rental Assistance and more'}
            </p>
            {step.content && (
              <p className="text-lg mt-4 max-w-2xl mx-auto">
                {step.content}
              </p>
            )}
          </div>
          
          {/* Form Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-8">
              {formContent}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps Section */}
      {showProgressSteps && stepDescriptions.length > 0 && (
        <div className="py-16 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <NumberedSteps 
              steps={stepDescriptions}
              layout="horizontal"
              animated={true}
              className=""
            />
          </div>
        </div>
      )}

      {/* Benefits Section */}
      {showBenefits && benefits.length > 0 && (
        <div className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <BenefitsList 
              benefits={benefits}
              title={benefitsTitle}
              layout="grid"
              checkmarkColor={accentColor}
              animated={true}
              imageUrl={benefitsImageUrl}
            />
            
            {/* CTA Button */}
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: buttonColor,
                  color: '#FFFFFF'
                }}
              >
                {buttonText}
              </Button>
              <p className="mt-4 text-sm text-gray-600">
                🔒 100% Secure and SPAM Free
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}