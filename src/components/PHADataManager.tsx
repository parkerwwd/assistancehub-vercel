
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const PHADataManager: React.FC = () => {
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          HUD PHA Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-12">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Set Up PHA Data Management
          </h3>
          <p className="text-gray-500">
            The database has been cleared and is ready for a fresh implementation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHADataManager;
