
import React from 'react';
import { AlertCircle, CheckCircle } from "lucide-react";
import { ImportResult } from '../types';

interface ImportResultsProps {
  importResult: ImportResult | null;
}

export const ImportResults: React.FC<ImportResultsProps> = ({ importResult }) => {
  if (!importResult) return null;

  return (
    <div className={`p-4 rounded-lg ${
      importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-start gap-2">
        {importResult.success ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className={`font-medium ${
            importResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {importResult.success ? 'Import Completed' : 'Import Failed'}
          </h4>
          <p className={`text-sm mt-1 ${
            importResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {importResult.message || importResult.error}
          </p>
          {importResult.success && importResult.processedCount && (
            <div className="mt-2 text-xs text-green-600">
              Successfully processed: {importResult.processedCount} records
              {importResult.errorCount && importResult.errorCount > 0 && (
                <span className="text-orange-600 ml-2">
                  ({importResult.errorCount} errors)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
