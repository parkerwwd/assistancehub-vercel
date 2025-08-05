import React from 'react';
import { Shield, Lock, Check, Star, Award, Zap } from 'lucide-react';

interface TrustBadge {
  type: 'security' | 'guarantee' | 'rating' | 'certification' | 'speed';
  text: string;
  icon?: string;
  color?: string;
}

interface TrustBadgesProps {
  badges: TrustBadge[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap = {
  shield: Shield,
  lock: Lock,
  check: Check,
  star: Star,
  award: Award,
  zap: Zap,
};

const presetColors = {
  security: '#10B981', // Green
  guarantee: '#3B82F6', // Blue
  rating: '#F59E0B', // Orange
  certification: '#8B5CF6', // Purple
  speed: '#EF4444', // Red
};

export default function TrustBadges({ 
  badges, 
  layout = 'horizontal', 
  size = 'md',
  className = '' 
}: TrustBadgesProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2 justify-center',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {badges.map((badge, index) => {
        const Icon = badge.icon ? iconMap[badge.icon as keyof typeof iconMap] : iconMap.shield;
        const badgeColor = badge.color || presetColors[badge.type];
        
        return (
          <div
            key={index}
            className={`
              inline-flex items-center gap-2 rounded-full border-2 font-medium
              transition-all duration-200 hover:shadow-md
              ${sizeClasses[size]}
            `}
            style={{
              backgroundColor: `${badgeColor}15`, // 15% opacity
              borderColor: `${badgeColor}40`, // 40% opacity
              color: badgeColor
            }}
          >
            {Icon && <Icon className={iconSizes[size]} />}
            <span>{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// Preset trust badge configurations
export const presetTrustBadges = {
  standard: [
    { type: 'security' as const, text: '100% Secure', icon: 'lock' },
    { type: 'guarantee' as const, text: 'SPAM Free', icon: 'shield' },
  ],
  
  comprehensive: [
    { type: 'security' as const, text: '256-bit SSL Encrypted', icon: 'lock' },
    { type: 'guarantee' as const, text: 'No SPAM Guarantee', icon: 'shield' },
    { type: 'rating' as const, text: '4.9/5 Rating', icon: 'star' },
    { type: 'speed' as const, text: 'Instant Results', icon: 'zap' },
  ],
  
  government: [
    { type: 'certification' as const, text: 'HUD Approved', icon: 'award' },
    { type: 'security' as const, text: 'Government Compliant', icon: 'shield' },
    { type: 'guarantee' as const, text: 'Free Service', icon: 'check' },
  ]
};