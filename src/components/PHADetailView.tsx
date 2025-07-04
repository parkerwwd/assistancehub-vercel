
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building, Image, Map } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor, getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import { GoogleMapsService } from "@/services/googleMapsService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
  onShowMap?: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack, onShowMap }) => {
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

  // Default waitlist status since the field doesn't exist in current schema
  const waitlistStatus = 'Unknown';

  return (
    <div className="h-full bg-gray-50">
      {/* Header - Mobile optimized */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Button>
      </div>

      {/* Content - Mobile optimized scrolling */}
      <div className="flex-1 overflow-y-auto p-3">
        <Card className="shadow-sm border-0 mb-4">
          {/* Address Image - Smaller for mobile */}
          {fullAddress && !imageError && (
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={showFallback ? staticMapImageUrl : streetViewImageUrl}
                alt={`Street view of ${office.name}`}
                className="w-full h-40 object-cover"
                onError={handleImageError}
                onLoad={() => console.log('Image loaded successfully')}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Image className="w-3 h-3" />
                {showFallback ? 'Map View' : 'Street View'}
              </div>
            </div>
          )}

          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-lg text-gray-900 leading-tight">
              {office.name}
            </CardTitle>
            {fullAddress && (
              <CardDescription className="flex items-start text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <button
                  onClick={onShowMap}
                  className="leading-relaxed hover:text-blue-600 hover:underline text-left"
                >
                  {fullAddress}
                </button>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-3 px-4">
            {/* Show Map Button */}
            {onShowMap && (
              <Button
                onClick={onShowMap}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Map className="w-4 h-4" />
                View on Map
              </Button>
            )}

            {/* PHA Type - Compact mobile design */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building className="w-4 h-4" />
                PHA Type
              </span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium border"
                style={{ 
                  backgroundColor: getPHATypeColor(phaType) + '15',
                  borderColor: getPHATypeColor(phaType) + '30',
                  color: getPHATypeColor(phaType)
                }}
              >
                {phaType}
              </span>
            </div>

            {/* Waitlist Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Status
              </span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium border"
                style={{ 
                  backgroundColor: getWaitlistColor(waitlistStatus) + '15',
                  borderColor: getWaitlistColor(waitlistStatus) + '30',
                  color: getWaitlistColor(waitlistStatus)
                }}
              >
                {waitlistStatus}
              </span>
            </div>

            {/* Contact Information - Mobile optimized */}
            {office.phone && (
              <a 
                href={`tel:${office.phone}`}
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
              >
                <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 group-hover:text-blue-800 font-medium text-sm">
                  {office.phone}
                </span>
              </a>
            )}
            
            {office.email && (
              <a 
                href={`mailto:${office.email}`}
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group border border-purple-100"
              >
                <FileText className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
                <span className="text-purple-700 group-hover:text-purple-800 font-medium text-sm">
                  {office.email}
                </span>
              </a>
            )}

            {/* Office Hours - Compact for mobile */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Office Hours</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Mon-Fri: 8:00 AM - 4:30 PM</p>
                <p>Sat-Sun: Closed</p>
              </div>
            </div>

            {/* View Housing Button - Full width for mobile */}
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 h-12 text-sm"
            >
              <Home className="w-4 h-4" />
              View Available Housing
            </Button>

            {/* Additional Information - Single column for mobile */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Section 8 Support</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {office.section8_units_count && office.section8_units_count > 0 ? 'Available' : 'Not Available'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">PHA Code</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">{office.pha_code || 'N/A'}</p>
              </div>
            </div>

            {/* Available Programs - Mobile optimized */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Available Programs</h4>
              <div className="space-y-2 text-sm">
                {office.section8_units_count && office.section8_units_count > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs">Section 8 Housing Choice Vouchers</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs">Public Housing Units</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs">Emergency Housing Assistance</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs">Senior Housing Programs</span>
                </div>
              </div>
            </div>

            {/* Data Source - Footer */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Data from HUD PHA Contact Information API
                {office.last_updated && (
                  <span className="block mt-1">
                    Updated: {new Date(office.last_updated).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHADetailView;
