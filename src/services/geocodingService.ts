
import { PHAAgency } from "@/types/phaOffice";

export interface GeocodedPHA extends PHAAgency {
  geocoded_latitude?: number;
  geocoded_longitude?: number;
}

// Basic geocoding using city names from US cities data
export const geocodePHAs = async (phas: PHAAgency[]): Promise<GeocodedPHA[]> => {
  console.log('⚠️ Database tables removed - returning empty geocoded data');
  return [];
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
