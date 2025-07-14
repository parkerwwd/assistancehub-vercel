import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Phone, Globe, Bed } from 'lucide-react';
import { Property, PropertyType } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onPropertyClick: (property: Property) => void;
  isSelected?: boolean;
}

export const PropertyCard = React.memo<PropertyCardProps>(({ property, onPropertyClick, isSelected = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onPropertyClick) {
      // Call the parent handler for selection
      onPropertyClick(property);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property/${property.id}`);
  };

  const getPropertyTypeBadge = (type: string | null) => {
    switch (type) {
      case PropertyType.TAX_CREDIT:
        return <Badge className="bg-green-500 text-white">Tax Credit</Badge>;
      case PropertyType.SECTION_8:
        return <Badge className="bg-blue-500 text-white">Section 8</Badge>;
      case PropertyType.PUBLIC_HOUSING:
        return <Badge className="bg-purple-500 text-white">Public Housing</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };
  
  const formatAddress = () => {
    const parts: string[] = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zip) parts.push(property.zip);
    return parts.join(', ');
  };
  
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
        isSelected 
          ? 'border-l-red-500 bg-red-50 shadow-md' 
          : 'border-l-red-300 bg-white hover:border-l-red-400'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-red-600" />
            {property.name}
          </h3>
          {getPropertyTypeBadge(property.property_type)}
        </div>
        
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <span className="line-clamp-2">{formatAddress()}</span>
        </div>
        
        {/* Units Available */}
        {property.units_available !== null && property.units_available !== undefined && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <Bed className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{property.units_available} units available</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {property.waitlist_open && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Waitlist Open
            </Badge>
          )}
          
          {property.bedroom_types && property.bedroom_types.length > 0 && (
            <div className="flex gap-1">
              {property.bedroom_types.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {property.phone && (
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
          {property.website && (
            <Button size="sm" variant="outline" className="flex-1">
              <Globe className="h-4 w-4 mr-1" />
              Website
            </Button>
          )}
          <Button 
            size="sm" 
            variant={isSelected ? "default" : "outline"} 
            className="flex-1"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PropertyCard.displayName = 'PropertyCard';
