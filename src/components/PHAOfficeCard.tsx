
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { MapPin, Heart, Phone, Building2, Navigation } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";
import type { PHAAgencyWithDistance } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAOfficeCardProps {
  agency: PHAAgency | PHAAgencyWithDistance;
  onOfficeClick?: (office: PHAAgency) => void;
}

const PHAOfficeCard = ({ agency, onOfficeClick }: PHAOfficeCardProps) => {
  const navigate = useNavigate();
  
  // Build full address using only the address field since city, state, zip don't exist in current schema
  const fullAddress = agency.address || 'Address not available';
  const phaType = getPHATypeFromData(agency);
  
  // Get distance if available
  const distance = (agency as PHAAgencyWithDistance)._distance;
  const isExactMatch = (agency as PHAAgencyWithDistance)._isExactMatch;

  const handleClick = () => {
    // Navigate to the dedicated PHA detail page
    navigate(`/pha/${agency.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 bg-white active:shadow-md" 
      onClick={handleClick}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Office Name with exact match indicator */}
            <div className="flex items-start gap-2 mb-2">
              <h4 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2">
                {agency.name}
              </h4>
              {isExactMatch && (
                <span className="flex-shrink-0 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                  ⭐ Match
                </span>
              )}
            </div>
            
            {/* Address with distance */}
            {fullAddress && (
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {fullAddress}
                  </p>
                  {distance !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Navigation className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">
                        {distance.toFixed(1)} miles away
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Info */}
            {agency.phone && (
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">
                  {agency.phone}
                </span>
              </div>
            )}
            
            {/* Bottom row with PHA Type */}
            <div className="flex items-center justify-between gap-3">
              {/* PHA Type badge */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{ 
                    backgroundColor: getPHATypeColor(agency.program_type) + '15',
                    borderColor: getPHATypeColor(agency.program_type) + '30',
                    color: getPHATypeColor(agency.program_type)
                  }}
                >
                  {agency.program_type}
                </span>
              </div>
            </div>
          </div>
          
          {/* Heart icon - More subtle on mobile */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality here
            }}
          >
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
        
        {/* Tap indicator for mobile */}
        <div className="mt-3 pt-3 border-t border-gray-100 sm:hidden">
          <div className="text-xs text-gray-500 text-center">
            Tap for details
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PHAOfficeCard;
