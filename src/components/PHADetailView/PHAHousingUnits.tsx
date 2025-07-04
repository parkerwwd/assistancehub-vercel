
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { hasValue, formatNumber } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAHousingUnitsProps {
  office: PHAAgency;
}

const PHAHousingUnits: React.FC<PHAHousingUnitsProps> = ({ office }) => {
  const hasHousingData = hasValue(office.total_units) || 
                        hasValue(office.total_occupied) || 
                        hasValue(office.section8_units_count) || 
                        hasValue(office.ph_occupied) ||
                        hasValue(office.total_dwelling_units) ||
                        hasValue(office.section8_occupied) ||
                        hasValue(office.regular_vacant) ||
                        hasValue(office.acc_units) ||
                        hasValue(office.pha_total_units);

  if (!hasHousingData) return null;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-5 h-5" />
          Housing Units Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hasValue(office.total_units) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <div className="text-2xl font-bold text-blue-700">{formatNumber(office.total_units)}</div>
              <div className="text-xs text-gray-600 mt-1">Total Units</div>
            </div>
          )}
          {hasValue(office.total_occupied) && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
              <div className="text-2xl font-bold text-green-700">{formatNumber(office.total_occupied)}</div>
              <div className="text-xs text-gray-600 mt-1">Total Occupied</div>
            </div>
          )}
          {hasValue(office.section8_units_count) && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
              <div className="text-2xl font-bold text-orange-700">{formatNumber(office.section8_units_count)}</div>
              <div className="text-xs text-gray-600 mt-1">Section 8 Units</div>
            </div>
          )}
          {hasValue(office.ph_occupied) && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
              <div className="text-2xl font-bold text-purple-700">{formatNumber(office.ph_occupied)}</div>
              <div className="text-xs text-gray-600 mt-1">Public Housing Occupied</div>
            </div>
          )}
        </div>

        {/* Additional Unit Details */}
        {(hasValue(office.total_dwelling_units) || hasValue(office.section8_occupied) || hasValue(office.regular_vacant) || hasValue(office.acc_units) || hasValue(office.pha_total_units)) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {hasValue(office.total_dwelling_units) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Dwelling Units</span>
                <span className="text-sm font-medium">{formatNumber(office.total_dwelling_units)}</span>
              </div>
            )}
            {hasValue(office.section8_occupied) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Section 8 Occupied</span>
                <span className="text-sm font-medium">{formatNumber(office.section8_occupied)}</span>
              </div>
            )}
            {hasValue(office.regular_vacant) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Regular Vacant</span>
                <span className="text-sm font-medium">{formatNumber(office.regular_vacant)}</span>
              </div>
            )}
            {hasValue(office.acc_units) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">ACC Units</span>
                <span className="text-sm font-medium">{formatNumber(office.acc_units)}</span>
              </div>
            )}
            {hasValue(office.pha_total_units) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">PHA Total Units</span>
                <span className="text-sm font-medium">{formatNumber(office.pha_total_units)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PHAHousingUnits;
