import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FlowProgressProps {
  current: number;
  total: number;
  percentage: number;
}

export default function FlowProgress({ current, total, percentage }: FlowProgressProps) {
  return (
    <div className="space-y-4">
      {/* Step counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Step {current} of {total}
        </span>
        <span className="text-gray-600 font-medium">
          {Math.round(percentage)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step indicators (for 5 or fewer steps) */}
      {total <= 5 && (
        <div className="flex items-center justify-between mt-6">
          {Array.from({ length: total }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < current;
            const isCurrent = stepNumber === current;

            return (
              <div key={index} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-primary text-white' : ''}
                    ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                    transition-all duration-300
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </motion.div>

                {index < total - 1 && (
                  <div
                    className={`
                      w-full h-1 mx-2
                      ${stepNumber < current ? 'bg-primary' : 'bg-gray-200'}
                      transition-colors duration-300
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}