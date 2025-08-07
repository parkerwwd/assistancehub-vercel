import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ThumbsUp } from 'lucide-react';
import { FlowStepWithFields } from '@/types/leadFlow';

interface RatingStepProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: Record<string, any>;
  onComplete: () => void;
}

type RatingStyle = 'stars' | 'hearts' | 'thumbs' | 'numeric';

export default function RatingStep({ step, onChange, values, onComplete }: RatingStepProps) {
  const field = step.fields?.[0]; // Rating typically has one field
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  if (!field) return null;
  
  const currentValue = values[field.field_name] || 0;
  const maxRating = field.validation_rules?.max || 5;
  const ratingStyle = (field.options?.[0]?.value as RatingStyle) || 'stars';
  const showLabels = field.options?.[1]?.value !== 'false';
  
  const handleRatingClick = (rating: number) => {
    onChange(field.field_name, rating);
    // Auto-advance after rating with a brief delay for feedback
    setTimeout(() => {
      onComplete();
    }, 300);
  };
  
  const getRatingIcon = (style: RatingStyle, filled: boolean) => {
    const className = `w-8 h-8 transition-all duration-200 ${
      filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
    }`;
    
    switch (style) {
      case 'hearts':
        return <Heart className={className} />;
      case 'thumbs':
        return <ThumbsUp className={className} />;
      case 'stars':
      default:
        return <Star className={className} />;
    }
  };
  
  const getRatingLabels = () => {
    if (!showLabels) return null;
    
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    
    return labels[hoveredRating || currentValue as keyof typeof labels] || '';
  };

  return (
    <div className="space-y-6">
      {step.content && (
        <div 
          className="prose prose-gray max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}
      
      <div className="flex flex-col items-center space-y-4">
        {/* Rating Icons */}
        <div className="flex space-x-2">
          {Array.from({ length: maxRating }, (_, index) => {
            const rating = index + 1;
            const isFilled = rating <= (hoveredRating || currentValue);
            
            return (
              <motion.button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-2"
              >
                {ratingStyle === 'numeric' ? (
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-200
                      ${isFilled 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    {rating}
                  </div>
                ) : (
                  getRatingIcon(ratingStyle, isFilled)
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Rating Label */}
        {showLabels && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-gray-700 h-6"
          >
            {getRatingLabels()}
          </motion.div>
        )}
        
        {/* Help Text */}
        {field.help_text && (
          <p className="text-sm text-gray-500 text-center">
            {field.help_text}
          </p>
        )}
      </div>
    </div>
  );
}
