
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADataFooterProps {
  office: PHAAgency;
}

const PHADataFooter: React.FC<PHADataFooterProps> = ({ office }) => {
  return (
    <Card className="shadow-sm border-0">
      <CardContent className="pt-4">
        <p className="text-xs text-gray-500 text-center">
          Data sourced from HUD PHA Contact Information API
          <br />
          Record ID: {office.id}
        </p>
      </CardContent>
    </Card>
  );
};

export default PHADataFooter;
