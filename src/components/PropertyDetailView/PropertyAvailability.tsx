import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from '@/types/property';
import { Home, CheckCircle2, XCircle } from 'lucide-react';

interface PropertyAvailabilityProps {
  property: Property;
}

const PropertyAvailability: React.FC<PropertyAvailabilityProps> = ({ property }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Home className="w-5 h-5 text-gray-600" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Units Available */}
          <div>
            <p className="text-sm text-gray-600 font-medium">Available Units</p>
            <p className="text-xl font-semibold">
              {property.units_available ?? 'Contact for availability'}
            </p>
            {property.units_total && (
              <p className="text-sm text-gray-500 mt-1">
                out of {property.units_total} total units
              </p>
            )}
          </div>
          
        </div>
        
        {/* Bedroom Types */}
        {property.bedroom_types && property.bedroom_types.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 font-medium mb-3">Unit Types Available</p>
            <div className="flex flex-wrap gap-2">
              {property.bedroom_types.map((type) => (
                <Badge key={type} variant="secondary" className="text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyAvailability; 