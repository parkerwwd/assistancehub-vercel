import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { STATES } from '@/data/locations/states';
import { FlowStepWithFields, FieldValues } from '@/types/leadFlow';

interface InteractiveLocationPickerProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: FieldValues;
  onSubmit: () => void;
  styleConfig?: any;
}

// Popular areas with high Section 8 availability
const POPULAR_AREAS = [
  { city: 'Houston', state: 'TX', zip: '77002', availability: 'High' },
  { city: 'Atlanta', state: 'GA', zip: '30303', availability: 'High' },
  { city: 'Chicago', state: 'IL', zip: '60601', availability: 'Medium' },
  { city: 'Phoenix', state: 'AZ', zip: '85001', availability: 'High' },
  { city: 'Philadelphia', state: 'PA', zip: '19101', availability: 'Medium' },
  { city: 'Detroit', state: 'MI', zip: '48201', availability: 'Very High' },
];

export default function InteractiveLocationPicker({
  step,
  onChange,
  values,
  onSubmit,
  styleConfig
}: InteractiveLocationPickerProps) {
  const [zipCode, setZipCode] = useState(values.zip || values.zipCode || '');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isValidZip, setIsValidZip] = useState(false);

  const fieldName = step.fields?.[0]?.field_name || 'zip';

  useEffect(() => {
    // Validate ZIP code
    const isValid = /^\d{5}$/.test(zipCode);
    setIsValidZip(isValid);
    if (isValid) {
      onChange(fieldName, zipCode);
    }
  }, [zipCode, onChange, fieldName]);

  const handleZipChange = (value: string) => {
    // Only allow numbers and limit to 5 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(cleaned);
  };

  const selectPopularArea = (area: typeof POPULAR_AREAS[0]) => {
    setZipCode(area.zip);
    setShowSuggestions(false);
    // Auto-submit after a short delay for smooth UX
    setTimeout(() => {
      onSubmit();
    }, 500);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Very High':
        return 'bg-green-500';
      case 'High':
        return 'bg-emerald-500';
      case 'Medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced title - only show if step doesn't have its own title */}
      {!step.title && (
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
          >
            <MapPin className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900">
            Where are you looking for housing?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'll instantly show you available Section 8 properties and housing authorities in your area
          </p>
        </div>
      )}

      {/* ZIP code input with visual feedback */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter your ZIP code"
            value={zipCode}
            onChange={(e) => handleZipChange(e.target.value)}
            className="text-center text-2xl font-semibold h-16 pr-12"
            style={{
              borderColor: isValidZip ? styleConfig?.primaryColor : undefined,
              borderWidth: isValidZip ? '2px' : undefined,
            }}
          />
          {isValidZip && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
        
        {zipCode.length > 0 && !isValidZip && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            {5 - zipCode.length} more digit{5 - zipCode.length !== 1 ? 's' : ''} needed
          </p>
        )}
      </div>

      {/* Popular areas - our differentiator */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Areas with high availability right now</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {POPULAR_AREAS.map((area, index) => (
              <motion.button
                key={area.zip}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectPopularArea(area)}
                className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                      {area.city}, {area.state}
                    </h3>
                    <p className="text-sm text-gray-500">{area.zip}</p>
                  </div>
                  <Badge 
                    className={`${getAvailabilityColor(area.availability)} text-white border-0`}
                  >
                    {area.availability}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500">
            or enter your ZIP code above
          </div>
        </motion.div>
      )}

      {/* Submit button */}
      {isValidZip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Button
            onClick={onSubmit}
            className="w-full h-14 text-lg font-semibold"
            style={{
              backgroundColor: styleConfig?.primaryColor || undefined,
            }}
          >
            <Search className="w-5 h-5 mr-2" />
            Find Housing in {zipCode}
          </Button>
        </motion.div>
      )}

      {/* Trust indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500"
      >
        <p>🔒 No personal information required at this step</p>
      </motion.div>
    </div>
  );
}