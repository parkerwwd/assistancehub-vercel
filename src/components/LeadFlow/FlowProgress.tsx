import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FlowProgressProps {
  current: number;
  total: number;
  percentage: number;
  stepsMeta?: Array<{ label?: string; module?: number; type?: string }>; // optional metadata for richer UI
}

export default function FlowProgress({ current, total, percentage, stepsMeta }: FlowProgressProps) {
  const moduleBar = useMemo(() => {
    if (!stepsMeta || stepsMeta.length === 0) return null;
    const modules: Array<{ module: number; indices: number[] }> = [];
    stepsMeta.forEach((m, idx) => {
      const moduleNumber = typeof m.module === 'number' ? m.module : 0;
      const existing = modules.find(x => x.module === moduleNumber);
      if (existing) existing.indices.push(idx); else modules.push({ module: moduleNumber, indices: [idx] });
    });
    modules.sort((a, b) => a.module - b.module);
    return modules;
  }, [stepsMeta]);

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

      {moduleBar && moduleBar.length > 0 && (
        <div className="mt-3">
          <div className="flex gap-1">
            {moduleBar.map((mod, i) => {
              const start = mod.indices[0];
              const end = mod.indices[mod.indices.length - 1];
              const isCurrent = current - 1 >= start && current - 1 <= end;
              return (
                <div key={i} className={`flex-1 h-2 rounded ${isCurrent ? 'bg-primary' : 'bg-gray-300'}`} />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {moduleBar.map((mod, i) => {
              const firstIndex = mod.indices[0];
              const label = stepsMeta?.[firstIndex]?.label || `Module ${mod.module || i + 1}`;
              return <span key={i}>{label}</span>;
            })}
          </div>
        </div>
      )}

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