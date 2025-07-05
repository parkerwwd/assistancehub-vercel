
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, ArrowRight, Building, Image } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import { GoogleMapsService } from "@/services/googleMapsService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailCardProps {
  office: PHAAgency;
  onOfficeClick?: (office: PHAAgency) => void;
}

const OfficeDetailCard = ({ office, onOfficeClick }: OfficeDetailCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Build full address using only the address field since city, state, zip don't exist in current schema
  const fullAddress = office.address || 'Address not available';

  const phaType = getPHATypeFromData(office);

  // Get Google Maps images
  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '400x200'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '400x200');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="h-full p-4 overflow-y-auto">
      <Card className="h-fit shadow-sm border-0">
        {/* Address Image */}
        {fullAddress && !imageError && (
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={showFallback ? staticMapImageUrl : streetViewImageUrl}
              alt={`Street view of ${office.name}`}
              className="w-full h-48 object-cover"
              onError={handleImageError}
              onLoad={() => console.log('Image loaded successfully')}
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Image className="w-3 h-3" />
              {showFallback ? 'Map View' : 'Street View'}
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 leading-tight pr-2">{office.name}</CardTitle>
          <CardDescription className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="leading-relaxed">{fullAddress}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* PHA Type Badge - Single centered badge */}
          <div className="flex justify-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Building className="w-4 h-4" />
                PHA Type:
              </span>
              <div className="text-center">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getPHATypeColor(phaType) + '20',
                    color: getPHATypeColor(phaType)
                  }}
                >
                  {phaType}
                </span>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-3">
            {office.phone && (
              <a 
                href={`tel:${office.phone}`}
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <Phone className="w-4 h-4 mr-3 text-blue-600" />
                <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                  {office.phone}
                </span>
              </a>
            )}
            
            {/* Website functionality disabled since field doesn't exist in current schema */}
          </div>

          {/* View Details Button */}
          {onOfficeClick && (
            <Button
              onClick={() => onOfficeClick(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              View Full Details & Housing Options
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          
          {/* Services List */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Available Services</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              {/* Display general services since we don't have specific unit counts */}
              <div>• Section 8 Housing Vouchers</div>
              <div>• Public Housing Units</div>
              <div>• Housing Assistance Programs</div>
              <div>• Rental Assistance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficeDetailCard;
