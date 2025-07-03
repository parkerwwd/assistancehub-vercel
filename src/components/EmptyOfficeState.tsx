
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyOfficeStateProps {
  loading: boolean;
  onShowAll?: () => void;
  hasFilter?: boolean;
}

const EmptyOfficeState = ({ loading, onShowAll, hasFilter }: EmptyOfficeStateProps) => {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <Card className="h-fit shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900">Find PHA Offices & Housing</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {loading
              ? "Loading PHA offices..."
              : hasFilter
                ? "No PHA offices found for the selected location. Try a different search or view all offices."
                : "Click on a map marker or search above to view PHA office details and available housing options."
            }
          </CardDescription>

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

export default EmptyOfficeState;
