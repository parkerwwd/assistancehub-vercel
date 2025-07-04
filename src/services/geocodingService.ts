import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface GeocodedPHA extends PHAAgency {
  geocoded_latitude?: number;
  geocoded_longitude?: number;
}

// Basic geocoding using city names from US cities data
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
