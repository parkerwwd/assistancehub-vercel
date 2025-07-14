import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, HeartHandshake, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyAmenitiesProps {
  property: Property;
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ property }) => {
  const amenityIcons: Record<string, string> = {
    'parking': '🚗',
    'laundry': '🧺',
    'playground': '🛝',
    'pool': '🏊',
    'gym': '🏋️',
    'fitness': '🏋️',
    'community': '🏘️',
    'garden': '🌳',
    'security': '🔒',
    'elevator': '🛗',
    'balcony': '🏠',
    'dishwasher': '🍽️',
    'ac': '❄️',
    'heat': '🔥',
    'storage': '📦'
  };

  const getAmenityIcon = (amenity: string) => {
    const key = amenity.toLowerCase();
    for (const [k, v] of Object.entries(amenityIcons)) {
      if (key.includes(k)) return v;
    }
    return '✨';
  };

  const formatAmenity = (amenity: string) => {
    return amenity.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const hasAmenities = property.amenities && property.amenities.length > 0;
  const hasAccessibility = property.accessibility_features && property.accessibility_features.length > 0;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Amenities & Features
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* General Amenities */}
        {hasAmenities && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Property Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities!.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5">
                  <span className="mr-1">{getAmenityIcon(amenity)}</span>
                  {formatAmenity(amenity)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility Features */}
        {hasAccessibility && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              Accessibility Features
            </h4>
            <div className="space-y-2">
              {property.accessibility_features!.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{formatAmenity(feature)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAmenities && !hasAccessibility && (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Amenity information not available
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Contact the property for details about available features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyAmenities; 