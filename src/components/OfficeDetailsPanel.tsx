
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
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900 leading-tight">{selectedOffice.name}</CardTitle>
          <CardDescription className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            {selectedOffice.address}
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
                backgroundColor: getWaitlistColor(selectedOffice.waitlistStatus) + '20',
                color: getWaitlistColor(selectedOffice.waitlistStatus)
              }}
            >
              {selectedOffice.waitlistStatus}
            </span>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-3">
            <a 
              href={`tel:${selectedOffice.phone}`}
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <Phone className="w-4 h-4 mr-3 text-blue-600" />
              <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                {selectedOffice.phone}
              </span>
            </a>
            
            <a 
              href={`https://${selectedOffice.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <ExternalLink className="w-4 h-4 mr-3 text-green-600" />
              <span className="text-green-700 group-hover:text-green-800 font-medium">
                Visit Website
              </span>
            </a>
          </div>
          
          {/* Services List */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Available Services</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div>• Section 8 Housing Vouchers</div>
              <div>• Public Housing Units</div>
              <div>• Housing Assistance Programs</div>
              <div>• Rental Assistance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-900">Find PHA Offices</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Click on a map marker or search above to view PHA office details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">12</div>
              <div className="text-xs text-green-600">Open</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">8</div>
              <div className="text-xs text-yellow-600">Limited</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-700">15</div>
              <div className="text-xs text-red-600">Closed</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="pt-4 border-t">
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
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Contact PHAs directly for the most current waitlist information.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeDetailsPanel;
