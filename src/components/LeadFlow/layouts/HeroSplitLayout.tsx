import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import { FlowWithSteps, FieldValues } from '@/types/leadFlow';

interface HeroSplitLayoutProps {
  flow: FlowWithSteps;
  children: React.ReactNode;
  onSubmit?: () => void;
  heroImage?: string;
  logo?: string;
  trustBadges?: string[];
  benefits?: string[];
  stepDescriptions?: Array<{
    number: number;
    color: string;
    description: string;
  }>;
}

export default function HeroSplitLayout({
  flow,
  children,
  onSubmit,
  heroImage,
  logo,
  trustBadges,
  benefits,
  stepDescriptions
}: HeroSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        {logo && (
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-20 mx-auto" />
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {flow.name}
            </h1>
            
            {/* Subtitle */}
            {flow.description && (
              <p className="text-gray-600 mb-6">
                {flow.description}
              </p>
            )}

            {/* Form Content */}
            <div className="space-y-4">
              {children}
            </div>

            {/* Trust Badge */}
            {trustBadges && trustBadges.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                {trustBadges.map((badge, index) => (
                  <span key={index}>{badge}</span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Hero Image & Steps */}
          <div className="space-y-6">
            {/* Hero Image */}
            {heroImage && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={heroImage} 
                  alt="Hero" 
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Numbered Steps */}
            {stepDescriptions && stepDescriptions.length > 0 && (
              <div className="space-y-4">
                {stepDescriptions.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex gap-4 items-start"
                  >
                    <div 
                      className={`
                        w-16 h-16 rounded-lg flex items-center justify-center
                        text-white text-2xl font-bold shadow-md flex-shrink-0
                      `}
                      style={{ backgroundColor: step.color }}
                    >
                      {step.number}
                    </div>
                    <p className="text-gray-700 pt-2">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {benefits && benefits.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              What Do I Get When Signing Up?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA Button */}
            <div className="mt-8 text-center">
              <button
                onClick={onSubmit}
                className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
              >
                Download Application Guide
              </button>
              <p className="mt-3 text-sm text-gray-600">
                🔒100% Secure and SPAM Free
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}