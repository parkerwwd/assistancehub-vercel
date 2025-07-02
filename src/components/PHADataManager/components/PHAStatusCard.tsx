
import React from 'react';

interface PHAStatusCardProps {
  totalPHAs: number;
  lastImport: Date | null;
}

export const PHAStatusCard: React.FC<PHAStatusCardProps> = ({ totalPHAs, lastImport }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">PHAs in Database:</span>
        <span className="text-lg font-semibold text-blue-600">{totalPHAs.toLocaleString()}</span>
      </div>
      {lastImport && (
        <div className="mt-2 text-xs text-gray-500">
          Last updated: {lastImport.toLocaleString()}
        </div>
      )}
    </div>
  );
};
