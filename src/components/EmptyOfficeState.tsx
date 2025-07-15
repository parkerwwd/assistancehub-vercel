
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { USLocation } from "@/data/usLocations";

interface EmptyOfficeStateProps {
  loading: boolean;
  hasFilter?: boolean;
  filteredLocation?: USLocation | null;
}

const EmptyOfficeState = ({ loading, hasFilter, filteredLocation }: EmptyOfficeStateProps) => {
  const getSearchDescription = () => {
    if (!filteredLocation) return "";
    
    switch (filteredLocation.type) {
      case 'state':
        return `Showing all PHA offices in ${filteredLocation.name}`;
      case 'city':
        return `Showing PHA offices within 25 miles of ${filteredLocation.name}, ${filteredLocation.stateCode}`;
      case 'county':
        return `Showing PHA offices in ${filteredLocation.name}, ${filteredLocation.stateCode}`;
      default:
        return `Showing PHA offices for ${filteredLocation.name}`;
    }
  };

  const getEmptyMessage = () => {
    if (loading) return "Loading PHA offices...";
    
    if (hasFilter && filteredLocation) {
      switch (filteredLocation.type) {
        case 'state':
          return `No PHA offices found in ${filteredLocation.name}. Try searching for a different state.`;
        case 'city':
          return `No PHA offices found within 25 miles of ${filteredLocation.name}. Try searching for a different city.`;
        case 'county':
          return `No PHA offices found in ${filteredLocation.name}. Try searching for a different county.`;
        default:
          return "No PHA offices found for the selected location. Try a different search.";
      }
    }
    
    return "Search for a city, county, or state above to find PHA offices and available housing options in your area.";
  };

  return (
    <div className="h-full p-4 overflow-y-auto">
      <Card className="h-fit shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900">Find PHA Offices & Housing</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {getEmptyMessage()}
          </CardDescription>

          {/* Show search description when there's an active filter */}
          {hasFilter && filteredLocation && !loading && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                {getSearchDescription()}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Logic Info */}
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Smart Search</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>States:</strong> Shows all PHA offices in the state</p>
                <p><strong>Cities:</strong> Shows offices within 25 miles</p>
                <p><strong>Counties:</strong> Shows offices in the county</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-medium text-gray-900 mb-3">Emergency Housing</h4>
                <p className="text-sm text-gray-600">
                  For immediate housing assistance, contact your local emergency services or shelter hotline.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-medium text-gray-900 mb-3">Housing Resources</h4>
                <p className="text-sm text-gray-600">
                  Visit <a href="https://www.hud.gov" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">HUD.gov</a> for comprehensive housing assistance programs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-medium text-gray-900 mb-3">Local Assistance</h4>
                <p className="text-sm text-gray-600">
                  Contact your city or county housing department for region-specific programs and resources.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Contact PHAs directly for the most current housing availability information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyOfficeState;
