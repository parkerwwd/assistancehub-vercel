import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Home, CreditCard, Shield, Users, Clock, MapPin } from 'lucide-react';

interface Step {
  number: number;
  title?: string;
  description: string;
  color: string;
  icon?: string;
}

interface NumberedStepsProps {
  steps: Step[];
  className?: string;
  layout?: 'vertical' | 'horizontal';
  animated?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  card: CreditCard,
  shield: Shield,
  users: Users,
  clock: Clock,
  map: MapPin,
};

export default function NumberedSteps({ 
  steps, 
  className = '', 
  layout = 'vertical',
  animated = true 
}: NumberedStepsProps) {
  // For horizontal layout, use grid for better competitor-style presentation
  if (layout === 'horizontal') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
        {steps.map((step, index) => {
          const Icon = step.icon ? iconMap[step.icon] : null;
          
          return (
            <motion.div
              key={index}
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { delay: index * 0.2 } : undefined}
              className="text-center"
            >
              {/* Step Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Step{step.number}
                </h3>
                
                {/* Icon Circle */}
                <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center relative"
                     style={{ backgroundColor: '#E0F2FE' }}>
                  {Icon ? (
                    <Icon className="w-12 h-12 text-cyan-600" />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                         style={{ backgroundColor: step.color }}>
                      {step.number}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Vertical layout (original)
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const Icon = step.icon ? iconMap[step.icon] : null;
        
        return (
          <motion.div
            key={index}
            initial={animated ? { opacity: 0, y: 20 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={animated ? { delay: index * 0.2 } : undefined}
            className="flex gap-4 items-start"
          >
            {/* Number Circle */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 relative overflow-hidden"
              style={{ backgroundColor: step.color }}
            >
              {/* Icon or Number */}
              {Icon ? (
                <Icon className="w-8 h-8" />
              ) : (
                <span>{step.number}</span>
              )}
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              {step.title && (
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {step.title}
                </h3>
              )}
              <p className="text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Preset step configurations
export const presetSteps = {
  section8Housing: [
    {
      number: 1,
      color: '#10B981',
      description: 'Find safe and affordable housing that meets you and your families needs and budget.',
      icon: 'home'
    },
    {
      number: 2,
      color: '#F59E0B',
      description: 'Once approved your landlord will receive monthly rent checks on your behalf covering most if not all of your rent requirements.',
      icon: 'card'
    },
    {
      number: 3,
      color: '#3B82F6',
      description: 'Take the stress of rent out of your life. Once approved you will receive a housing choice voucher. This voucher guarantees living accommodations allowing you to focus on other areas of your life.',
      icon: 'shield'
    }
  ],
  
  generalApplication: [
    {
      number: 1,
      color: '#8B5CF6',
      title: 'Quick Assessment',
      description: 'Answer a few simple questions about your needs and eligibility.',
      icon: 'users'
    },
    {
      number: 2,
      color: '#06B6D4',
      title: 'Instant Results',
      description: 'Get immediate feedback on your application status and next steps.',
      icon: 'clock'
    },
    {
      number: 3,
      color: '#10B981',
      title: 'Get Connected',
      description: 'We connect you with the right resources and assistance programs.',
      icon: 'map'
    }
  ]
};