
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { hasValue, formatNumber, formatPercentage } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAOccupancyStatsProps {
  office: PHAAgency;
}

const PHAOccupancyStats: React.FC<PHAOccupancyStatsProps> = ({ office }) => {
  const hasOccupancyData = hasValue(office.pct_occupied) || 
                          hasValue(office.pct_reported) || 
                          hasValue(office.number_reported);

  if (!hasOccupancyData) return null;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Occupancy & Reporting Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {hasValue(office.pct_occupied) && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
              <div className="text-2xl font-bold text-green-700">{formatPercentage(office.pct_occupied)}</div>
              <div className="text-xs text-gray-600 mt-1">Occupancy Rate</div>
            </div>
          )}
          {hasValue(office.pct_reported) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <div className="text-2xl font-bold text-blue-700">{formatPercentage(office.pct_reported)}</div>
              <div className="text-xs text-gray-600 mt-1">Reporting Rate</div>
            </div>
          )}
          {hasValue(office.number_reported) && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
              <div className="text-2xl font-bold text-yellow-700">{formatNumber(office.number_reported)}</div>
              <div className="text-xs text-gray-600 mt-1">Number Reported</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAOccupancyStats;
