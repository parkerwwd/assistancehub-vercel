
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Map, Building, FileText } from "lucide-react";
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
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-3">
        <div className="mb-2">
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            {office.name}
          </h1>
          {fullAddress && (
            <div className="flex items-start gap-2 text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mt-0.5 text-blue-600" />
              <span className="text-xs">{fullAddress}</span>
            </div>
          )}
        </div>

        {/* Show Map Button */}
        {onShowMap && (
          <Button
            onClick={onShowMap}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-7 mb-2 text-xs"
          >
            <Map className="w-3 h-3" />
            Show on Map
          </Button>
        )}

        {/* PHA Type and PHA Code Side by Side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Building className="w-3 h-3 mx-auto mb-1 text-blue-600" />
            <div className="text-xs text-gray-500 mb-1">PHA Type</div>
            <div 
              className="px-2 py-0.5 rounded-full text-xs font-medium inline-block"
              style={{ 
                backgroundColor: getPHATypeColor(phaType) + '20',
                color: getPHATypeColor(phaType)
              }}
            >
              {phaType}
            </div>
          </div>
          
          {office.pha_code && (
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              <FileText className="w-3 h-3 mx-auto mb-1 text-gray-600" />
              <div className="text-xs text-gray-500 mb-1">PHA Code</div>
              <div className="px-2 py-0.5 rounded-full text-xs font-medium inline-block bg-gray-200 text-gray-700">
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
