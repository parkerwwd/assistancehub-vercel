import React from 'react';
import { motion } from 'framer-motion';
import { FlowStepWithFields } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface ContentStepProps {
  step: FlowStepWithFields;
  styleConfig?: any;
}

export default function ContentStep({ step, styleConfig }: ContentStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Rich content area */}
      <div 
        className="prose prose-lg prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: step.content || '' }}
      />

      {/* Optional CTA section */}
      {step.button_text && step.button_text !== 'Next' && (
        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            className="group"
            style={{
              backgroundColor: styleConfig?.primaryColor || undefined,
            }}
          >
            {step.button_text}
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}