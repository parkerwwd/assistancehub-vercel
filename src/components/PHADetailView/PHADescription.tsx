import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { FileText } from "lucide-react";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADescriptionProps {
  office: PHAAgency;
}

const PHADescription: React.FC<PHADescriptionProps> = ({ office }) => {
  // Generate a generic AI-written description for each PHA
  const generateDescription = (office: PHAAgency) => {
    const phaName = office.name || 'Housing Authority';
    const city = office.city || 'the area';
    const state = office.state || 'the region';
    
    return `The ${phaName} serves as a vital resource for affordable housing assistance in ${city}, ${state}. As a public housing authority, this organization works diligently to provide safe, decent, and affordable housing opportunities for low-income families, elderly residents, and individuals with disabilities. Through various housing programs including Section 8 Housing Choice Vouchers, public housing units, and specialized assistance programs, they help bridge the gap between housing costs and what families can afford. The authority collaborates with local landlords, property managers, and community organizations to ensure a diverse range of housing options are available throughout the community. Their mission centers on creating stable housing solutions that enable families to thrive and contribute to their neighborhoods while maintaining dignity and independence.`;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <FileText className="w-5 h-5 text-blue-600" />
          About This Housing Authority
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed text-sm">
          {generateDescription(office)}
        </p>
      </CardContent>
    </Card>
  );
};

export default PHADescription; 