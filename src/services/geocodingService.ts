
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface GeocodedPHA extends PHAAgency {
  geocoded_latitude?: number;
  geocoded_longitude?: number;
}

// Enhanced geocoding service using Mapbox API
export const geocodePHAAddress = async (address: string, mapboxToken: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || !mapboxToken) {
    console.warn('Missing address or mapbox token for geocoding');
    return null;
  }
  
  try {
    // Clean and encode the address properly
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    const encodedAddress = encodeURIComponent(cleanAddress);
    
    console.log('🗺️ Geocoding address:', cleanAddress);
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=US&types=address,poi`
    );
    
    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      console.log('✅ Successfully geocoded:', cleanAddress, '→', { lat, lng });
      console.log('📍 Place details:', feature.place_name);
      
      return { lat, lng };
    } else {
      console.warn('⚠️ No geocoding results for address:', cleanAddress);
      return null;
    }
  } catch (error) {
    console.error('❌ Geocoding error for address:', address, error);
    return null;
  }
};

// Basic geocoding using city names from US cities data (fallback)
export const geocodePHAs = async (phas: PHAAgency[]): Promise<GeocodedPHA[]> => {
  // Import US cities data
  const { usCities } = await import("@/data/usCities");
  
  return phas.map(pha => {
    // Skip if already has geocoded coordinates
    if ((pha as any).geocoded_latitude && (pha as any).geocoded_longitude) {
      return pha;
    }

    // Extract city name from phone field (where city names are stored)
    const cityName = pha.phone?.toLowerCase().trim();
    
    if (cityName) {
      // Find matching city in US cities data
      const matchingCity = usCities.find(city => 
        city.name.toLowerCase() === cityName ||
        city.name.toLowerCase().includes(cityName) ||
        cityName.includes(city.name.toLowerCase())
      );

      if (matchingCity) {
        return {
          ...pha,
          geocoded_latitude: matchingCity.latitude,
          geocoded_longitude: matchingCity.longitude
        };
      }
    }

    return pha;
  });
};

// Get coordinates for city search to center the map
export const getCityCoordinates = async (cityName: string, stateCode?: string): Promise<{ latitude: number; longitude: number } | null> => {
  const { usCities } = await import("@/data/usCities");
  
  const city = usCities.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase() &&
    (!stateCode || c.stateCode.toLowerCase() === stateCode.toLowerCase())
  );

  return city ? { latitude: city.latitude, longitude: city.longitude } : null;
};
