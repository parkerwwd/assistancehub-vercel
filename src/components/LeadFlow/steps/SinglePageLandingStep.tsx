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
            w-full border-2 rounded-lg
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:border-blue-500 focus:outline-none
            transition-colors
            ${config.layoutType === 'formLeft' ? 'px-8 py-6 text-xl' : 'px-4 py-3 text-base'}
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
    <form onSubmit={handleSubmit} className={config.layoutType === 'formLeft' ? 'space-y-8' : 'space-y-6'}>
      {/* Form Title - for other layouts */}
      {config.layoutType !== 'formLeft' && step.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.title}
        </h2>
      )}

      {/* Form Subtitle - for other layouts */}
      {config.layoutType !== 'formLeft' && step.subtitle && (
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
          className={`w-full font-bold shadow-lg hover:shadow-xl transition-all ${
            config.layoutType === 'formLeft' ? 'py-8 text-2xl' : 'py-4 text-lg'
          }`}
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
        <div className="mt-6">
          <TrustBadges 
            badges={trustBadges} 
            layout="horizontal"
            size={config.layoutType === 'formLeft' ? 'md' : 'sm'}
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
      <div className="min-h-screen bg-white">
        {/* Header with Logo */}
        {logo && (
          <div className="bg-white py-6 lg:py-8 px-4 sm:px-6 lg:px-8 2xl:px-0 border-b">
            <img src={logo} alt="Logo" className="h-20 lg:h-24" />
          </div>
        )}
        
        {/* Hero Section - Form Left, Image Right */}
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-0 py-12 lg:py-20">
          <div className="grid lg:grid-cols-[2fr,1fr] xl:grid-cols-[3fr,1fr] 2xl:grid-cols-[4fr,1fr] gap-8 lg:gap-12 items-start">
            {/* Left Column - Form - Takes More Space */}
            <div className="w-full">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#003D7A] mb-4">
                {step.title || 'APPLY HERE FOR:'}
              </h1>
              <h2 className="text-xl lg:text-2xl xl:text-3xl text-gray-700 mb-10 leading-relaxed">
                {step.subtitle || 'SECTION 8 VOUCHERS GOVERNMENT HOUSING RENTAL ASSISTANCE AND MORE'}
              </h2>
              
              {step.content && (
                <p className="text-gray-600 mb-8 italic text-base lg:text-lg">
                  {step.content}
                </p>
              )}
              
              {/* Form - Full Width */}
              <div className="bg-white shadow-2xl rounded-2xl p-10 lg:p-14 xl:p-20 border border-gray-100 w-full">
                <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-10">
                  Apply Here For:
                </h3>
                <p className="text-xl lg:text-2xl xl:text-3xl text-gray-700 mb-12 leading-relaxed">
                  SECTION 8 VOUCHERS<br />
                  GOVERNMENT HOUSING RENTAL ASSISTANCE AND MORE
                </p>
                {formContent}
              </div>
            </div>
            
            {/* Right Column - Image - Smaller */}
            <div className="relative lg:sticky lg:top-20 hidden lg:block">
              {heroImage && (
                <img 
                  src={heroImage} 
                  alt="Happy family" 
                  className="rounded-xl w-full shadow-2xl max-w-md ml-auto"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Steps Section - Below Hero */}
        {showProgressSteps && stepDescriptions.length > 0 && (
          <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-0 py-16 lg:py-20 bg-gray-50">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
              {stepDescriptions.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-6 bg-white rounded-xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div 
                    className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center text-white text-4xl lg:text-5xl font-bold rounded-lg flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Benefits Section */}
        {showBenefits && benefits.length > 0 && (
          <div className="bg-gray-50 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 2xl:px-0">
            <div className="w-full">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-900 mb-12 text-center">
                {benefitsTitle}
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Benefits Image - Left */}
                {benefitsImageUrl && (
                  <div>
                    <img 
                      src={benefitsImageUrl} 
                      alt="Benefits" 
                      className="rounded-xl w-full shadow-xl"
                    />
                  </div>
                )}
                
                {/* Benefits List - Right */}
                <div className={benefitsImageUrl ? '' : 'lg:col-span-2 max-w-3xl mx-auto'}>
                  <div className="space-y-6 mb-10">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700 text-lg leading-relaxed">
                          {typeof benefit === 'string' ? benefit : benefit.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <div className="text-center lg:text-left">
                    <Button
                      size="lg"
                      className="px-10 py-6 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg"
                    >
                      {buttonText}
                    </Button>
                    <div className="mt-6 flex items-center gap-4 text-base text-gray-600">
                      <span className="text-2xl">🔒</span>
                      <span>100% Secure</span>
                      <span className="text-2xl">✓</span>
                      <span>SPAM Free</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-gray-100 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 2xl:px-0 text-center">
          <p className="text-xs lg:text-sm text-gray-500 leading-relaxed">
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