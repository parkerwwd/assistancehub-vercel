
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Clock, Building2 } from "lucide-react";

interface StateSearchGuideProps {
  stateName: string;
}

const StateSearchGuide: React.FC<StateSearchGuideProps> = ({ stateName }) => {
  const navigate = useNavigate();

  const handleShowAllOffices = () => {
    navigate(`/state/${encodeURIComponent(stateName)}/offices`);
  };

  const handleViewOnMap = () => {
    navigate('/section8', { 
      state: { 
        searchLocation: { 
          name: stateName, 
          type: 'state',
          stateCode: stateName 
        } 
      } 
    });
  };

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            How to Find Section 8 Housing in {stateName}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Find Your Local PHA</h3>
                <p className="text-gray-600 text-sm">
                  Browse our comprehensive list of Public Housing Authorities in {stateName} to find offices near you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full mt-1">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Contact Directly</h3>
                <p className="text-gray-600 text-sm">
                  Call or visit your local PHA office to inquire about Section 8 voucher programs and application processes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-full mt-1">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check Waitlist Status</h3>
                <p className="text-gray-600 text-sm">
                  Many PHAs have waitlists. Contact them to learn about current availability and application deadlines.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full mt-1">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Explore Locations</h3>
                <p className="text-gray-600 text-sm">
                  Use our interactive map to explore PHA locations and find offices convenient to your area.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button 
            onClick={handleShowAllOffices}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Show All Offices in {stateName}
          </Button>
          <Button 
            onClick={handleViewOnMap}
            variant="outline" 
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <MapPin className="w-4 h-4 mr-2" />
            View on Interactive Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateSearchGuide;
