import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FlowStepWithFields, FieldValues } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';
import { Home, Clock, Users, Heart, Zap, DollarSign } from 'lucide-react';

interface QuizStepProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: FieldValues;
  onComplete: () => void;
}

// Quiz option with icon mapping
const iconMap: { [key: string]: any } = {
  home: Home,
  clock: Clock,
  users: Users,
  heart: Heart,
  zap: Zap,
  dollar: DollarSign,
};

export default function QuizStep({ step, onChange, values, onComplete }: QuizStepProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const field = step.fields?.[0]; // Quiz typically has one field with multiple options
  const allowRetake = step.settings?.allowRetake !== false; // default true
  const correctValue: string | undefined = useMemo(() => {
    if (!field?.options) return undefined;
    const found = (field.options as any[]).find(opt => opt.correct === true);
    return found?.value;
  }, [field]);

  const handleSubmit = () => {
    if (!field || !selectedOption) return;
    const correct = correctValue !== undefined ? selectedOption === correctValue : null;
    setIsCorrect(correct === null ? null : correct);
    setSubmitted(true);
    // Persist answer + correctness
    onChange(field.field_name, selectedOption);
    onChange(`${field.field_name}__correct`, correct);
    // If correct or no correctness configured, continue
    if (correct === null || correct === true) {
      setTimeout(() => onComplete(), 300);
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setIsCorrect(null);
    setSelectedOption(null);
  };

  if (!field || !field.options) {
    return null;
  }

  return (
    <div className="space-y-8">
      {step.content && (
        <div 
          className="prose prose-gray max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {field.options.map((option: any, index: number) => {
          const Icon = iconMap[option.icon] || Home;
          const isSelected = selectedOption === option.value;

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !submitted && setSelectedOption(option.value)}
              className={`
                relative group p-6 rounded-xl border-2 transition-all duration-200
                ${isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 hover:border-primary/50 hover:shadow-md bg-white'}
                ${submitted && option.correct ? 'ring-2 ring-green-500' : ''}
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'}
                `}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className={`font-semibold text-lg ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && !submitted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="text-center mt-6 space-x-2">
        {!submitted && (
          <Button disabled={!selectedOption} onClick={handleSubmit}>Submit</Button>
        )}
        {submitted && isCorrect === false && allowRetake && (
          <Button variant="outline" onClick={handleRetake}>Try again</Button>
        )}
        {!step.is_required && !submitted && (
          <Button variant="ghost" onClick={onComplete} className="text-gray-500 hover:text-gray-700">Skip</Button>
        )}
      </div>

      {submitted && isCorrect !== null && (
        <div className={`text-center text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? 'Correct! Great job.' : 'Not quite right. Please try again.'}
        </div>
      )}
    </div>
  );
}