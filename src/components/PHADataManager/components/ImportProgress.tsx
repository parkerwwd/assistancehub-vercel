
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { ImportProgress as ImportProgressType } from '../types';

interface ImportProgressProps {
  importProgress: ImportProgressType;
  isImporting: boolean;
}

export const ImportProgressComponent: React.FC<ImportProgressProps> = ({ importProgress, isImporting }) => {
  const progressPercentage = importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0;

  if (!isImporting) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Importing HUD Data...</span>
        <span>{importProgress.current} of {importProgress.total}</span>
      </div>
      <Progress value={progressPercentage} className="w-full" />
      {importProgress.currentRecord && (
        <div className="text-xs text-gray-500 truncate">
          Processing: {importProgress.currentRecord}
        </div>
      )}
    </div>
  );
};
