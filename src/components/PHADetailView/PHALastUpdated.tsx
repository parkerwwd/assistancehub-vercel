
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHALastUpdatedProps {
  office: PHAAgency;
}

const PHALastUpdated: React.FC<PHALastUpdatedProps> = ({ office }) => {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-3 h-3 text-blue-600" />
          Last Updated
        </CardTitle>
        <CardDescription className="text-xs">Data information</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            {new Date(office.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHALastUpdated;
