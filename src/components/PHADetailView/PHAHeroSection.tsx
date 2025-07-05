
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Image, Building2 } from "lucide-react";
import { GoogleMapsService } from "@/services/googleMapsService";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAHeroSectionProps {
  office: PHAAgency;
}

const PHAHeroSection: React.FC<PHAHeroSectionProps> = ({ office }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const fullAddress = office.address || '';

  // Get both Street View and Static Map images
  const { streetView: streetViewImageUrl, staticMap: staticMapImageUrl } = GoogleMapsService.getBestImageForAddress(fullAddress, '800x400');

  const handleImageError = () => {
    console.log('Image error occurred, showFallback:', showFallback);
    if (!showFallback) {
      console.log('Switching to static map fallback');
      setShowFallback(true);
    } else {
      console.log('Static map also failed, showing default view');
      setImageError(true);
    }
  };

  // If no address or both images failed, show default gradient view
  if (!fullAddress || imageError) {
    return (
      <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="relative h-64 lg:h-80 flex items-center justify-center">
          <div className="text-center text-white">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{office.name}</h1>
            <p className="text-blue-100 text-lg">{fullAddress || 'Address not available'}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-white">
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={showFallback ? staticMapImageUrl : streetViewImageUrl}
          alt={`View of ${office.name}`}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          onError={handleImageError}
          onLoad={() => console.log('✅ Image loaded successfully:', showFallback ? 'Static Map' : 'Street View')}
        />
        
        {/* Modern Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
            {office.name}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-4 drop-shadow-md">
            {fullAddress}
          </p>
        </div>
        
        {/* Image Type Badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
          <Image className="w-4 h-4" />
          {showFallback ? 'Map View' : 'Street View'}
        </div>
      </div>
    </Card>
  );
};

export default PHAHeroSection;
