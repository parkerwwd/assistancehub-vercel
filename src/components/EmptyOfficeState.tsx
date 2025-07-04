
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyOfficeStateProps {
  loading: boolean;
  onShowAll?: () => void;
  hasFilter?: boolean;
  filteredLocation?: any;
}

const EmptyOfficeState = ({ loading, onShowAll, hasFilter, filteredLocation }: EmptyOfficeStateProps) => {
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
          return `No PHA offices found in ${filteredLocation.name}. Try a different state or view all offices.`;
        case 'city':
          return `No PHA offices found within 25 miles of ${filteredLocation.name}. Try a different city or view all offices.`;
        case 'county':
          return `No PHA offices found in ${filteredLocation.name}. Try a different county or view all offices.`;
        default:
          return "No PHA offices found for the selected location. Try a different search or view all offices.";
      }
    }
    
    return "Click on a map marker or search above to view PHA office details and available housing options.";
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

          {/* Show All button when there's a filter but no results */}
          {!loading && hasFilter && onShowAll && (
            <div className="mt-4">
              <Button
                onClick={onShowAll}
                variant="outline"
                className="w-full"
              >
                Show All PHA Offices
              </Button>
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

export default EmptyOfficeState;
