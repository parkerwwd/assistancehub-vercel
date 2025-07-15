import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MapPin, Building } from "lucide-react";

interface PropertyBasicInfoProps {
  property: Property;
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({ property }) => {
  const formatBedroomTypes = (types: string[] | null) => {
    if (!types || types.length === 0) return 'Contact for details';
    
    const labels: Record<string, string> = {
      'studio': 'Studio',
      '1br': '1 Bedroom',
      '2br': '2 Bedrooms',
      '3br': '3 Bedrooms',
      '4br+': '4+ Bedrooms'
    };
    
    return types.map(type => labels[type] || type).join(', ');
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Building className="w-5 h-5 text-red-600" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Property Type */}
        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Property Type</p>
            <p className="text-gray-900">
              {property.property_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Affordable Housing'}
            </p>
          </div>
        </div>

        {/* Full Address */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Full Address</p>
            <p className="text-gray-900">
              {property.address}<br />
              {property.city && `${property.city}, `}
              {property.state} {property.zip}
            </p>
          </div>
        </div>

        {/* Unit Types */}
        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Available Unit Types</p>
            <p className="text-gray-900">{formatBedroomTypes(property.bedroom_types)}</p>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};

export default PropertyBasicInfo; 