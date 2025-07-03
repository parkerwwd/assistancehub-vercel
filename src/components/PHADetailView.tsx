
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText, ArrowLeft, Building } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor, getPHATypeFromData, getPHATypeColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack }) => {
  // Build full address, handling the case where city might be in phone field
  const addressParts = [office.address];
  
  // Check if phone field contains city name (non-numeric data)
  const phoneContainsCity = office.phone && !/^[\d\s\-\(\)\+\.]+$/.test(office.phone);
  
  if (phoneContainsCity) {
    addressParts.push(office.phone);
  } else if (office.city) {
    addressParts.push(office.city);
  }
  
  if (office.state) {
    addressParts.push(office.state);
  }
  
  if (office.zip) {
    addressParts.push(office.zip);
  }
  
  const fullAddress = addressParts.filter(Boolean).join(', ');
  
  // Use phone for contact only if it's actually a phone number
  const actualPhone = phoneContainsCity ? null : office.phone;

  const phaType = getPHATypeFromData(office);

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="shadow-sm border-0 mb-4">
          {/* Office Image */}
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop&crop=center"
              alt={`${office.name} building`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to a gradient background with building icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div class="text-center">
                      <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 8h2M7 21h2"></path>
                        </svg>
                      </div>
                      <p class="text-sm text-gray-600 font-medium">${office.name}</p>
                    </div>
                  </div>
                `;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 leading-tight pr-2">
              {office.name}
            </CardTitle>
            {fullAddress && (
              <CardDescription className="flex items-start text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span className="leading-relaxed">{fullAddress}</span>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* PHA Type - Most prominent */}
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

            {/* Waitlist Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Waitlist Status
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium border"
                style={{ 
                  backgroundColor: getWaitlistColor(office.waitlist_status || 'Unknown') + '15',
                  borderColor: getWaitlistColor(office.waitlist_status || 'Unknown') + '30',
                  color: getWaitlistColor(office.waitlist_status || 'Unknown')
                }}
              >
                {office.waitlist_status || 'Unknown'}
              </span>
            </div>

            {/* Contact Information - Improved layout */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm mb-3">Contact Information</h4>
              
              {actualPhone && (
                <a 
                  href={`tel:${actualPhone}`}
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
                >
                  <Phone className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                    {actualPhone}
                  </span>
                </a>
              )}
              
              {office.website && (
                <a 
                  href={office.website.startsWith('http') ? office.website : `https://${office.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group border border-green-100"
                >
                  <ExternalLink className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 group-hover:text-green-800 font-medium">
                    Visit Website
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
            </div>

            {/* Office Hours - Compact */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Office Hours</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
                <p>Saturday - Sunday: Closed</p>
              </div>
            </div>

            {/* View Housing Button */}
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 h-11"
            >
              <Home className="w-4 h-4" />
              View Available Housing in Area
            </Button>

            {/* Additional Information - Grid layout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">HCV Support</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {office.supports_hcv ? 'Yes' : 'No'}
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

            {/* Available Programs - Cleaner list */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Available Programs</h4>
              <div className="space-y-2 text-sm">
                {office.supports_hcv && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    Section 8 Housing Choice Vouchers
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  Public Housing Units
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  Emergency Housing Assistance
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  Senior Housing Programs
                </div>
              </div>
            </div>

            {/* Data Source - Footer */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Data sourced from HUD PHA Contact Information API
                {office.last_updated && (
                  <span className="block mt-1">
                    Last updated: {new Date(office.last_updated).toLocaleDateString()}
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
