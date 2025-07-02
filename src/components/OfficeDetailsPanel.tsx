
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, ArrowRight, Heart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailsPanelProps {
  selectedOffice?: PHAAgency | null;
  onOfficeClick?: (office: PHAAgency) => void;
  phaAgencies: PHAAgency[];
  loading: boolean;
}

const OfficeDetailsPanel = ({ selectedOffice, onOfficeClick, phaAgencies, loading }: OfficeDetailsPanelProps) => {
  // If we have a selected office, show detailed view
  if (selectedOffice) {
    const fullAddress = [selectedOffice.address, selectedOffice.city, selectedOffice.state, selectedOffice.zip]
      .filter(Boolean)
      .join(', ');

    return (
      <div className="h-full p-4 overflow-y-auto">
        <Card className="h-fit shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 leading-tight pr-2">{selectedOffice.name}</CardTitle>
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
                  backgroundColor: getWaitlistColor(selectedOffice.waitlist_status || 'Unknown') + '20',
                  color: getWaitlistColor(selectedOffice.waitlist_status || 'Unknown')
                }}
              >
                {selectedOffice.waitlist_status || 'Unknown'}
              </span>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-3">
              {selectedOffice.phone && (
                <a 
                  href={`tel:${selectedOffice.phone}`}
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <Phone className="w-4 h-4 mr-3 text-blue-600" />
                  <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                    {selectedOffice.phone}
                  </span>
                </a>
              )}
              
              {selectedOffice.website && (
                <a 
                  href={selectedOffice.website.startsWith('http') ? selectedOffice.website : `https://${selectedOffice.website}`}
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
                onClick={() => onOfficeClick(selectedOffice)}
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
                {selectedOffice.supports_hcv && (
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
  }

  // If we have multiple PHAs loaded (from search), show clean card list
  if (phaAgencies.length > 0 && !loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">PHA Offices</h3>
          <p className="text-sm text-gray-600 mt-1">{phaAgencies.length} offices found</p>
        </div>
        
        <div className="p-4 space-y-3">
          {phaAgencies.map((agency) => {
            // Build full address - ensure we show complete address
            const fullAddress = [agency.address, agency.city, agency.state, agency.zip]
              .filter(Boolean)
              .join(', ');
            
            return (
              <Card key={agency.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white" onClick={() => onOfficeClick?.(agency)}>
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
          })}
        </div>
      </div>
    );
  }

  // Default empty state
  return (
    <div className="h-full p-4 overflow-y-auto">
      <Card className="h-fit shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900">Find PHA Offices & Housing</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {loading ? "Loading PHA offices..." : "Click on a map marker or search above to view PHA office details and available housing options."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Integration Info */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">New Feature</h4>
              <p className="text-sm text-blue-800">
                Click on any PHA to view detailed information and browse available low-income housing options in that area.
              </p>
            </div>
            
            {/* Legend */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3">Waitlist Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-gray-700">Open - Accepting applications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-gray-700">Limited - Partial openings</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-gray-700">Closed - No current openings</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Tip:</strong> Contact PHAs directly for the most current waitlist information and housing availability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficeDetailsPanel;
