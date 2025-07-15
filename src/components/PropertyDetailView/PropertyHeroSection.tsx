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
    <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
      <div className="space-y-3 sm:space-y-4">
        {/* Property Type Badge */}
        <div>{getPropertyTypeBadge(property.property_type)}</div>
        
        {/* Property Name - Mobile Responsive */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{property.name}</h1>
        
        {/* Location - Mobile Responsive */}
        <div className="flex items-start sm:items-center gap-2 text-white/90">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-sm sm:text-base md:text-lg break-words">
            {property.address}
            {property.city && `, ${property.city}`}
            {property.state && `, ${property.state}`}
            {property.zip && ` ${property.zip}`}
          </span>
        </div>
        
        {/* Key Stats - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {/* Total Units */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Total Units</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{property.units_total || 'N/A'}</p>
          </div>
          
          {/* Available Units */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Available Units</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              {property.units_available ?? 'Contact for availability'}
            </p>
          </div>
          
          {/* Contact Actions - Mobile Optimized */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Contact Info</span>
            </div>
            <div className="space-y-2">
              {property.phone && (
                <a 
                  href={`tel:${property.phone}`} 
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors touch-manipulation"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">{property.phone}</span>
                </a>
              )}
              {property.email && (
                <a 
                  href={`mailto:${property.email}`} 
                  className="text-white hover:text-white/80 transition-colors text-xs sm:text-sm break-all block"
                >
                  {property.email}
                </a>
              )}
              {property.website && (
                <a 
                  href={property.website.startsWith('http') ? property.website : `https://${property.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors touch-manipulation"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Visit Website</span>
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