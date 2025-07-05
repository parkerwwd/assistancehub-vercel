
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAHousingProgramsProps {
  office: PHAAgency;
}

const PHAHousingPrograms: React.FC<PHAHousingProgramsProps> = ({ office }) => {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Home className="w-3 h-3 text-purple-600" />
          Housing Programs
        </CardTitle>
        <CardDescription className="text-xs">Available housing assistance programs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {office.program_type && (
          <div className="flex items-center p-2 bg-purple-50 rounded-lg border border-purple-100">
            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2">
              <Home className="w-3 h-3 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">Program Type</div>
              <div className="text-sm font-semibold text-purple-700">
                {office.program_type}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-1">
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium">Section 8 Housing Choice Vouchers</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium">Public Housing Units</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs font-medium">Emergency Housing Assistance</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span className="text-xs font-medium">Senior Housing Programs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAHousingPrograms;
