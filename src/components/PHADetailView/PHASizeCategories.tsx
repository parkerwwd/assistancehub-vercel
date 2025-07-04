
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { hasValue } from './utils';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHASizeCategoriesProps {
  office: PHAAgency;
}

const PHASizeCategories: React.FC<PHASizeCategoriesProps> = ({ office }) => {
  const hasSizeData = hasValue(office.combined_size_category) || 
                     hasValue(office.low_rent_size_category) || 
                     hasValue(office.section8_size_category) || 
                     hasValue(office.program_type);

  if (!hasSizeData) return null;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Size Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hasValue(office.combined_size_category) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Combined Size Category</span>
              <span className="text-sm font-medium">{office.combined_size_category}</span>
            </div>
          )}
          {hasValue(office.low_rent_size_category) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Low Rent Size Category</span>
              <span className="text-sm font-medium">{office.low_rent_size_category}</span>
            </div>
          )}
          {hasValue(office.section8_size_category) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Section 8 Size Category</span>
              <span className="text-sm font-medium">{office.section8_size_category}</span>
            </div>
          )}
          {hasValue(office.program_type) && (
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Program Type</span>
              <span className="text-sm font-medium">{office.program_type}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHASizeCategories;
