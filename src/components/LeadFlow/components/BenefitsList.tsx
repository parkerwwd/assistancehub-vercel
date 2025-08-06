import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Gift, Zap, Shield, Users } from 'lucide-react';

interface Benefit {
  text: string;
  icon?: string;
  highlighted?: boolean;
}

interface BenefitsListProps {
  benefits: Benefit[];
  title?: string;
  layout?: 'single' | 'double' | 'triple' | 'grid';
  checkmarkStyle?: 'circle' | 'square' | 'rounded';
  checkmarkColor?: string;
  animated?: boolean;
  className?: string;
  imageUrl?: string;
}

const iconMap = {
  check: Check,
  star: Star,
  gift: Gift,
  zap: Zap,
  shield: Shield,
  users: Users,
};

export default function BenefitsList({
  benefits,
  title = "What You'll Get",
  layout = 'double',
  checkmarkStyle = 'circle',
  checkmarkColor = '#10B981',
  animated = true,
  className = '',
  imageUrl
}: BenefitsListProps) {
  const gridCols = {
    single: 'grid-cols-1',
    double: 'grid-cols-1 md:grid-cols-2',
    triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    grid: 'grid-cols-1 md:grid-cols-2' // Competitor style
  };

  const checkmarkClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  };

  // Special styling for competitor grid layout
  if (layout === 'grid') {
    return (
      <div className={className}>
        {title && (
          <motion.h2 
            initial={animated ? { opacity: 0, y: 10 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center"
          >
            {title}
          </motion.h2>
        )}
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Image on left */}
          <div className="lg:w-1/2">
            <img 
              src={imageUrl || "/lovable-uploads/80384fe9-e82f-4176-b42b-cf132c13a51f.png"} 
              alt="Beautiful home" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          
          {/* Benefits on right */}
          <div className="lg:w-1/2">
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon ? iconMap[benefit.icon as keyof typeof iconMap] : Check;
                
                return (
                  <motion.div
                    key={index}
                    initial={animated ? { opacity: 0, x: 20 } : undefined}
                    animate={animated ? { opacity: 1, x: 0 } : undefined}
                    transition={animated ? { delay: index * 0.1 } : undefined}
                    className="flex gap-3 items-start"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: checkmarkColor }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 leading-relaxed text-lg">
                      {benefit.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original layouts
  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      {title && (
        <motion.h3 
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          className="text-2xl font-bold text-gray-900 mb-6 text-center"
        >
          {title}
        </motion.h3>
      )}
      
      <div className={`grid ${gridCols[layout]} gap-4`}>
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon ? iconMap[benefit.icon as keyof typeof iconMap] : Check;
          
          return (
            <motion.div
              key={index}
              initial={animated ? { opacity: 0, x: -10 } : undefined}
              animate={animated ? { opacity: 1, x: 0 } : undefined}
              transition={animated ? { delay: index * 0.1 } : undefined}
              className={`
                flex gap-3 items-start p-3 rounded-lg transition-all duration-200
                ${benefit.highlighted 
                  ? 'bg-green-50 border-2 border-green-200 shadow-sm' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div 
                className={`
                  w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${checkmarkClasses[checkmarkStyle]}
                `}
                style={{ backgroundColor: checkmarkColor }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className={`
                text-gray-700 leading-relaxed
                ${benefit.highlighted ? 'font-medium text-gray-900' : ''}
              `}>
                {benefit.text}
              </span>
            </motion.div>
          );
        })}
      </div>
      
      {/* Optional CTA section */}
      <motion.div
        initial={animated ? { opacity: 0, y: 10 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={animated ? { delay: benefits.length * 0.1 + 0.2 } : undefined}
        className="mt-8 text-center"
      >
        <div className="text-sm text-gray-500 mb-3">
          Join thousands of families who have found housing assistance
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
          <Shield className="w-4 h-4" />
          <span>🔒 100% Secure and SPAM Free</span>
        </div>
      </motion.div>
    </div>
  );
}

// Preset benefit configurations
export const presetBenefits = {
  section8: [
    { text: 'Instructions For Your Local Housing Agency', highlighted: false },
    { text: 'Nationwide Income Limits', highlighted: false },
    { text: 'Eligibility Requirements', highlighted: true },
    { text: 'Email Alerts', highlighted: false },
    { text: 'Housing and Property List In Your Area', highlighted: true },
    { text: 'Section 8 Waiting List Openings In Your Area', highlighted: false },
    { text: 'Helpful Information On Credit, Income, And Other Key Factors', highlighted: false },
    { text: 'Factors Affecting Approval Status', highlighted: false },
  ],
  
  general: [
    { text: 'Free Application Assessment', icon: 'gift' },
    { text: 'Instant Eligibility Check', icon: 'zap' },
    { text: 'Personal Support Representative', icon: 'users' },
    { text: 'Secure Document Upload', icon: 'shield' },
    { text: 'Priority Application Processing', icon: 'star' },
    { text: 'Email Status Updates', icon: 'check' },
  ],
  
  premium: [
    { text: 'VIP Application Processing', highlighted: true, icon: 'star' },
    { text: 'Dedicated Case Manager', highlighted: true, icon: 'users' },
    { text: 'Document Review Service', icon: 'shield' },
    { text: 'Application Status Tracking', icon: 'zap' },
    { text: 'Priority Customer Support', icon: 'gift' },
    { text: 'Success Guarantee', highlighted: true, icon: 'check' },
  ]
};