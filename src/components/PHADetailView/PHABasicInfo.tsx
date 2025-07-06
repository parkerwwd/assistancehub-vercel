
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Map, Building, FileText, Info } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHABasicInfoProps {
  office: PHAAgency;
  onShowMap?: () => void;
}

const PHABasicInfo: React.FC<PHABasicInfoProps> = ({ office, onShowMap }) => {
  const fullAddress = office.address || 'Address not available';
  const phaType = getPHATypeFromData(office);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Info className="w-5 h-5 text-blue-600" />
          Office Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address Section */}
        {fullAddress && (
          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-1">Address</div>
              <div className="text-gray-900 font-medium">{fullAddress}</div>
            </div>
          </div>
        )}

        {/* Show Map Button */}
        {onShowMap && (
          <Button
            onClick={onShowMap}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 h-12 font-medium transition-all duration-200 hover:shadow-md"
          >
            <Map className="w-4 h-4" />
            Show on Interactive Map
          </Button>
        )}

        {/* PHA Type and Code Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHA Type */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-purple-600" />
              <div className="text-sm font-medium text-gray-700">PHA Type</div>
            </div>
            <div 
              className="px-3 py-2 rounded-lg text-sm font-semibold text-center shadow-sm"
              style={{ 
                backgroundColor: getPHATypeColor(phaType) + '20',
                color: getPHATypeColor(phaType),
                border: `1px solid ${getPHATypeColor(phaType)}30`
              }}
            >
              {office.program_type}
            </div>
          </div>
          
          {/* PHA Code */}
          {office.pha_code && (
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-gray-700">PHA Code</div>
              </div>
              <div className="px-3 py-2 rounded-lg text-sm font-semibold text-center bg-gray-200/80 text-gray-700 shadow-sm border border-gray-300/50">
                {office.pha_code}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHABasicInfo;
