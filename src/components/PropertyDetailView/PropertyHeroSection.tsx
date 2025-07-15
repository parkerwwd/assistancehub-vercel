import React from 'react';
import { Property } from "@/types/property";
import { MapPin, Home, Calendar, Phone, Mail, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyHeroSectionProps {
  property: Property;
}

const PropertyHeroSection: React.FC<PropertyHeroSectionProps> = ({ property }) => {
  const getPropertyTypeBadge = (type: string | null) => {
    switch (type) {
      case 'section_8':
        return <Badge className="bg-blue-600 text-white">Section 8</Badge>;
      case 'public_housing':
        return <Badge className="bg-green-600 text-white">Public Housing</Badge>;
      case 'tax_credit':
        return <Badge className="bg-purple-600 text-white">Tax Credit (LIHTC)</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Affordable Housing</Badge>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl shadow-xl p-8">
      <div className="space-y-4">
        {/* Property Type Badge */}
        <div>{getPropertyTypeBadge(property.property_type)}</div>
        
        {/* Property Name */}
        <h1 className="text-3xl md:text-4xl font-bold">{property.name}</h1>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-white/90">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">
            {property.address}
            {property.city && `, ${property.city}`}
            {property.state && `, ${property.state}`}
            {property.zip && ` ${property.zip}`}
          </span>
        </div>
        
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Total Units</span>
            </div>
            <p className="text-2xl font-bold">{property.units_total || 'N/A'}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Available Units</span>
            </div>
            <p className="text-2xl font-bold">
              {property.units_available ?? 'Contact for availability'}
            </p>
          </div>
          
          {/* Contact Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Contact Info</span>
            </div>
            <div className="space-y-2">
              {property.phone && (
                <a 
                  href={`tel:${property.phone}`} 
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {property.phone}
                </a>
              )}
              {property.email && (
                <a 
                  href={`mailto:${property.email}`} 
                  className="text-white hover:text-white/80 transition-colors text-sm break-all"
                >
                  {property.email}
                </a>
              )}
              {property.website && (
                <a 
                  href={property.website.startsWith('http') ? property.website : `https://${property.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeroSection; 