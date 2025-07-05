
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
import { GoogleMapsService } from "@/services/googleMapsService";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAHeroSectionProps {
  office: PHAAgency;
}

const PHAHeroSection: React.FC<PHAHeroSectionProps> = ({ office }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const fullAddress = office.address || 'Address not available';

  const streetViewImageUrl = GoogleMapsService.getStreetViewImage({
    address: fullAddress,
    size: '300x150'
  });

  const staticMapImageUrl = GoogleMapsService.getStaticMapImage(fullAddress, '300x150');

  const handleImageError = () => {
    if (!showFallback) {
      setShowFallback(true);
    } else {
      setImageError(true);
    }
  };

  if (!fullAddress || imageError) return null;

  return (
    <Card className="overflow-hidden shadow-sm border-0 bg-white">
      <div className="relative h-32 overflow-hidden">
        <img
          src={showFallback ? staticMapImageUrl : streetViewImageUrl}
          alt={`View of ${office.name}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
          <Image className="w-2 h-2" />
          {showFallback ? 'Map' : 'Street'}
        </div>
      </div>
    </Card>
  );
};

export default PHAHeroSection;
