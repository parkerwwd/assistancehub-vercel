
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, ArrowRight } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailCardProps {
  office: PHAAgency;
  onOfficeClick?: (office: PHAAgency) => void;
}

const OfficeDetailCard = ({ office, onOfficeClick }: OfficeDetailCardProps) => {
  const fullAddress = [office.address, office.city, office.state, office.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="h-full p-4 overflow-y-auto">
      <Card className="h-fit shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 leading-tight pr-2">{office.name}</CardTitle>
          <CardDescription className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="leading-relaxed">{fullAddress}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Waitlist Status Badge */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Waitlist Status:
            </span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: getWaitlistColor(office.waitlist_status || 'Unknown') + '20',
                color: getWaitlistColor(office.waitlist_status || 'Unknown')
              }}
            >
              {office.waitlist_status || 'Unknown'}
            </span>
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
            
            {office.website && (
              <a 
                href={office.website.startsWith('http') ? office.website : `https://${office.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <ExternalLink className="w-4 h-4 mr-3 text-green-600" />
                <span className="text-green-700 group-hover:text-green-800 font-medium">
                  Visit Website
                </span>
              </a>
            )}
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
              {office.supports_hcv && (
                <div>• Section 8 Housing Vouchers</div>
              )}
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
