import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Home, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyAvailabilityProps {
  property: Property;
}

const PropertyAvailability: React.FC<PropertyAvailabilityProps> = ({ property }) => {
  const formatRentRange = () => {
    if (!property.rent_range_min && !property.rent_range_max) {
      return 'Contact for pricing';
    }
    if (property.rent_range_min && property.rent_range_max) {
      return `$${property.rent_range_min} - $${property.rent_range_max}/month`;
    }
    if (property.rent_range_min) {
      return `From $${property.rent_range_min}/month`;
    }
    if (property.rent_range_max) {
      return `Up to $${property.rent_range_max}/month`;
    }
    return 'Contact for pricing';
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <DollarSign className="w-5 h-5 text-green-600" />
          Availability & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Rent Range */}
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">Monthly Rent</p>
            <p className="text-xl font-semibold text-green-700">{formatRentRange()}</p>
          </div>
        </div>

        {/* Units Available */}
        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">Available Units</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">
                {property.units_available ?? 'Contact for availability'} 
                {property.units_total && property.units_available !== null && (
                  <span className="text-sm text-gray-500 font-normal">
                    {' '}of {property.units_total} total
                  </span>
                )}
              </p>
              {property.units_available && property.units_available > 0 && (
                <Badge className="bg-green-100 text-green-700">Available Now</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Waitlist Status */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">Waitlist Status</p>
            <div className="flex items-center gap-2">
              {property.waitlist_open ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Waitlist Open</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    {property.waitlist_status || 'Waitlist Closed'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {property.last_updated && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(property.last_updated).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyAvailability; 