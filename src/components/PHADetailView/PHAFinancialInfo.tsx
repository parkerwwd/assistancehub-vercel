
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { hasValue, formatCurrency } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAFinancialInfoProps {
  office: PHAAgency;
}

const PHAFinancialInfo: React.FC<PHAFinancialInfoProps> = ({ office }) => {
  const hasFinancialData = hasValue(office.opfund_amount) || 
                          hasValue(office.opfund_amount_prev_yr) || 
                          hasValue(office.capfund_amount);

  if (!hasFinancialData) return null;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hasValue(office.opfund_amount) && (
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm font-medium text-gray-700">Operating Fund Amount</span>
              <span className="text-sm font-bold text-green-700">{formatCurrency(office.opfund_amount)}</span>
            </div>
          )}
          {hasValue(office.opfund_amount_prev_yr) && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-gray-700">Operating Fund (Previous Year)</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(office.opfund_amount_prev_yr)}</span>
            </div>
          )}
          {hasValue(office.capfund_amount) && (
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
              <span className="text-sm font-medium text-gray-700">Capital Fund Amount</span>
              <span className="text-sm font-bold text-purple-700">{formatCurrency(office.capfund_amount)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAFinancialInfo;
