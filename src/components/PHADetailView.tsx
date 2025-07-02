
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Users, Clock, Home, DollarSign, FileText } from "lucide-react";
import { PHAOffice } from "@/types/phaOffice";
import { getWaitlistColor } from "@/utils/mapUtils";

interface PHADetailViewProps {
  office: PHAOffice;
  onViewHousing: (office: PHAOffice) => void;
  onBack: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack }) => {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="mb-4"
        >
          ← Back to Map
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-gray-900 leading-tight pr-2">
            {office.name}
          </CardTitle>
          <CardDescription className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="leading-relaxed">{office.address}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Waitlist Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Waitlist Status:
            </span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: getWaitlistColor(office.waitlistStatus) + '20',
                color: getWaitlistColor(office.waitlistStatus)
              }}
            >
              {office.waitlistStatus}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <a 
              href={`tel:${office.phone}`}
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <Phone className="w-4 h-4 mr-3 text-blue-600" />
              <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                {office.phone}
              </span>
            </a>
            
            <a 
              href={`https://${office.website}`}
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

          {/* Office Hours */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Office Hours</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
              <p>Saturday - Sunday: Closed</p>
            </div>
          </div>

          {/* Available Housing */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <Button
              onClick={() => onViewHousing(office)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Home className="w-4 h-4" />
              View Available Housing in Area
            </Button>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Browse low-income housing options near this PHA
            </p>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Income Limit</span>
                </div>
                <p className="text-sm text-gray-900">50% AMI</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Application</span>
                </div>
                <p className="text-sm text-gray-900">Online/In-Person</p>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Available Programs</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Section 8 Housing Choice Vouchers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Public Housing Units
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Emergency Housing Assistance
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Senior Housing Programs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PHADetailView;
