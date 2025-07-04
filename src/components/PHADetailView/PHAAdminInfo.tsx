
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { hasValue } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAAdminInfoProps {
  office: PHAAgency;
}

const PHAAdminInfo: React.FC<PHAAdminInfoProps> = ({ office }) => {
  const hasAdminData = hasValue(office.fiscal_year_end) || 
                      hasValue(office.last_updated) || 
                      hasValue(office.created_at);

  if (!hasAdminData) return null;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Administrative Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hasValue(office.fiscal_year_end) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Fiscal Year End</span>
              <span className="text-sm font-medium">{office.fiscal_year_end}</span>
            </div>
          )}
          {hasValue(office.last_updated) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {new Date(office.last_updated).toLocaleDateString()}
              </span>
            </div>
          )}
          {hasValue(office.created_at) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Record Created</span>
              <span className="text-sm font-medium">
                {new Date(office.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAAdminInfo;
