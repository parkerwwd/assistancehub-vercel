
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Building, Image } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import { GoogleMapsService } from "@/services/googleMapsService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAMainInfoProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
}

const PHAMainInfo: React.FC<PHAMainInfoProps> = ({ office, onViewHousing }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const fullAddress = office.address || '';
  const phaType = getPHATypeFromData(office);

  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '400x250'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '400x250');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      {/* Address Image */}
      {fullAddress && !imageError && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={showFallback ? staticMapImageUrl : streetViewImageUrl}
            alt={`Street view of ${office.name}`}
            className="w-full h-56 object-cover"
            onError={handleImageError}
            onLoad={() => console.log('Image loaded successfully')}
          />
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Image className="w-3 h-3" />
            {showFallback ? 'Map View' : 'Street View'}
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-900 leading-tight pr-2">
          {office.name}
        </CardTitle>
        {office.pha_code && (
          <CardDescription className="text-sm text-gray-600">
            PHA Code: {office.pha_code}
          </CardDescription>
        )}
        {fullAddress && (
          <CardDescription className="flex items-start text-sm text-gray-600 mt-2">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="leading-relaxed">{fullAddress}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* PHA Type & Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              PHA Type
            </span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium border"
              style={{ 
                backgroundColor: getPHATypeColor(phaType) + '15',
                borderColor: getPHATypeColor(phaType) + '30',
                color: getPHATypeColor(phaType)
              }}
            >
              {phaType}
            </span>
          </div>

          {office.phas_designation && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <span className="text-sm font-medium text-gray-700">
                PHAS Designation
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                {office.phas_designation}
              </span>
            </div>
          )}
        </div>

        {/* View Housing Button */}
        <Button
          onClick={() => onViewHousing(office)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 h-11"
        >
          <Home className="w-4 h-4" />
          View Available Housing in Area
        </Button>
      </CardContent>
    </Card>
  );
};

export default PHAMainInfo;
