
import React from 'react';
import { Shield, Lock, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SecurityNotice: React.FC = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Shield className="w-5 h-5" />
          Security & Privacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            <strong>Data Security:</strong> All data modifications require authentication and are logged for security monitoring.
          </p>
        </div>
        
        <div className="flex items-start gap-2">
          <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            <strong>Public Data:</strong> PHA contact information is public data and can be viewed by anyone. No personal information is stored.
          </p>
        </div>
        
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            <strong>Data Import:</strong> CSV imports are limited to 50MB and 100,000 records for security and performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
