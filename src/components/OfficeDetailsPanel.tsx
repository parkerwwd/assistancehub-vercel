
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, ExternalLink, Users } from "lucide-react";
import { PHAOffice } from "@/types/phaOffice";
import { getWaitlistColor } from "@/utils/mapUtils";

interface OfficeDetailsPanelProps {
  selectedOffice?: PHAOffice | null;
}

const OfficeDetailsPanel = ({ selectedOffice }: OfficeDetailsPanelProps) => {
  if (selectedOffice) {
    return (
      <Card className="h-full shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900 leading-tight">{selectedOffice.name}</CardTitle>
          <CardDescription className="flex items-start text-xs text-gray-600">
            <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-blue-600" />
            {selectedOffice.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Waitlist Status Badge */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Waitlist Status:
            </span>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: getWaitlistColor(selectedOffice.waitlistStatus) + '20',
                color: getWaitlistColor(selectedOffice.waitlistStatus)
              }}
            >
              {selectedOffice.waitlistStatus}
            </span>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-2">
            <a 
              href={`tel:${selectedOffice.phone}`}
              className="flex items-center p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors group"
            >
              <Phone className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-blue-700 group-hover:text-blue-800 font-medium text-sm">
                {selectedOffice.phone}
              </span>
            </a>
            
            <a 
              href={`https://${selectedOffice.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-green-50 rounded-md hover:bg-green-100 transition-colors group"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-green-700 group-hover:text-green-800 font-medium text-sm">
                Visit Website
              </span>
            </a>
          </div>
          
          {/* Services List - Compact */}
          <div className="pt-2 border-t">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Available Services</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div>• Section 8 Vouchers</div>
              <div>• Public Housing</div>
              <div>• Housing Assistance</div>
              <div>• Rental Programs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-gray-900">Find PHA Offices</CardTitle>
        <CardDescription className="text-xs text-gray-600">
          Click on a map marker or search above to view PHA office details.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded-md">
              <div className="text-lg font-bold text-green-700">12</div>
              <div className="text-xs text-green-600">Open</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-md">
              <div className="text-lg font-bold text-yellow-700">8</div>
              <div className="text-xs text-yellow-600">Limited</div>
            </div>
            <div className="p-2 bg-red-50 rounded-md">
              <div className="text-lg font-bold text-red-700">15</div>
              <div className="text-xs text-red-600">Closed</div>
            </div>
          </div>
          
          {/* Legend - Compact */}
          <div className="pt-2 border-t">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Waitlist Status</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">Open - Accepting applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-gray-700">Limited - Partial openings</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-700">Closed - No current openings</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600">
              <strong>Tip:</strong> Contact PHAs directly for the most current waitlist information.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeDetailsPanel;
