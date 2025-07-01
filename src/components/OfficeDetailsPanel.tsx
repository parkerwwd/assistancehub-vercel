
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import { PHAOffice } from "@/types/phaOffice";
import { getWaitlistColor } from "@/utils/mapUtils";

interface OfficeDetailsPanelProps {
  selectedOffice?: PHAOffice | null;
}

const OfficeDetailsPanel = ({ selectedOffice }: OfficeDetailsPanelProps) => {
  if (selectedOffice) {
    return (
      <Card className="h-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">{selectedOffice.name}</CardTitle>
          <CardDescription className="flex items-start text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            {selectedOffice.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Waitlist Status:</span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: getWaitlistColor(selectedOffice.waitlistStatus) + '20',
                color: getWaitlistColor(selectedOffice.waitlistStatus)
              }}
            >
              {selectedOffice.waitlistStatus}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Phone className="w-4 h-4 mr-3 text-blue-600" />
              <a 
                href={`tel:${selectedOffice.phone}`}
                className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
              >
                {selectedOffice.phone}
              </a>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <ExternalLink className="w-4 h-4 mr-3 text-green-600" />
              <a 
                href={`https://${selectedOffice.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 font-medium transition-colors text-sm"
              >
                Visit Website
              </a>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Available Services</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Section 8 Housing Choice Vouchers</li>
              <li>• Public Housing Applications</li>
              <li>• Housing Assistance Programs</li>
              <li>• Rental Assistance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Find PHA Offices</CardTitle>
        <CardDescription className="text-gray-600">
          Click on a marker on the map or search above to view details about Public Housing Authority offices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Waitlist Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-gray-700">Open Waitlist</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                <span className="text-gray-700">Limited Opening</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <span className="text-gray-700">Closed Waitlist</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Waitlist status can change frequently. Always contact the PHA directly for the most current information.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeDetailsPanel;
