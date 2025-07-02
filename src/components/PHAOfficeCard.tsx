
import React from 'react';
import { Card } from "@/components/ui/card";
import { MapPin, Heart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAOfficeCardProps {
  agency: PHAAgency;
  onOfficeClick?: (office: PHAAgency) => void;
}

const PHAOfficeCard = ({ agency, onOfficeClick }: PHAOfficeCardProps) => {
  const fullAddress = [agency.address, agency.city, agency.state, agency.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <Card 
      key={agency.id} 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white" 
      onClick={() => onOfficeClick?.(agency)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h4 className="font-semibold text-gray-900 text-base leading-tight mb-2">
              {agency.name}
            </h4>
            
            {fullAddress && (
              <p className="text-sm text-gray-600 mb-3 flex items-start leading-relaxed">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{fullAddress}</span>
              </p>
            )}
            
            {/* Status badge */}
            <div className="flex items-center">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium border inline-block"
                style={{ 
                  backgroundColor: getWaitlistColor(agency.waitlist_status || 'Unknown') + '15',
                  borderColor: getWaitlistColor(agency.waitlist_status || 'Unknown') + '30',
                  color: getWaitlistColor(agency.waitlist_status || 'Unknown')
                }}
              >
                {agency.waitlist_status || 'Unknown'}
              </span>
            </div>
          </div>
          
          {/* Heart icon */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality here
            }}
          >
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PHAOfficeCard;
