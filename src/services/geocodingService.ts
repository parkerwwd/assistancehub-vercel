
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
    // Check if we already have geocoded coordinates
    if ((pha as any).geocoded_latitude && (pha as any).geocoded_longitude) {
      return pha;
    }

    // Check if the database has latitude/longitude fields
    if ((pha as any).latitude && (pha as any).longitude) {
      return {
        ...pha,
        geocoded_latitude: Number((pha as any).latitude),
        geocoded_longitude: Number((pha as any).longitude)
      };
    }

    // Try to extract city and state from address field
    let cityName = '';
    let stateCode = '';
    
    if (pha.address) {
      // Try to parse city and state from address (format: "123 Main St, City, ST 12345")
      const addressParts = pha.address.split(',');
      if (addressParts.length >= 3) {
        // Extract city (second to last part)
        cityName = addressParts[addressParts.length - 2]?.trim().toLowerCase() || '';
        
        // Extract state from last part (format: "ST 12345")
        const stateZipPart = addressParts[addressParts.length - 1]?.trim() || '';
        const stateMatch = stateZipPart.match(/^([A-Z]{2})\s+\d{5}/);
        if (stateMatch) {
          stateCode = stateMatch[1].toLowerCase();
        }
      }
    }
    
    // If we have a city field, use it (in case database has it)
    if ((pha as any).city) {
      cityName = (pha as any).city.toLowerCase().trim();
    }
    
    // If we have a state field, use it (in case database has it)
    if ((pha as any).state) {
      stateCode = (pha as any).state.toLowerCase().trim();
    }
    
    if (cityName) {
      // Find matching city in US cities data
      const matchingCity = usCities.find(city => {
        const cityMatches = city.name.toLowerCase() === cityName ||
                          city.name.toLowerCase().includes(cityName) ||
                          cityName.includes(city.name.toLowerCase());
        
        // If we have a state code, make sure it matches too
        if (stateCode && cityMatches) {
          return city.stateCode.toLowerCase() === stateCode;
        }
        
        return cityMatches;
      });

      if (matchingCity) {
        console.log(`✅ Found coordinates for ${pha.name}: ${matchingCity.name}, ${matchingCity.stateCode}`);
        return {
          ...pha,
          geocoded_latitude: matchingCity.latitude,
          geocoded_longitude: matchingCity.longitude
        };
      }
    }

    // If still no match and we have an address, we could use the Mapbox geocoding
    // For now, just return the PHA without geocoded coordinates
    console.warn(`⚠️ No coordinates found for PHA: ${pha.name} at ${pha.address}`);
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
