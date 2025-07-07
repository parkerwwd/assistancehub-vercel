
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
    
    // First check if we have city and state fields directly
    if ((pha as any).city) {
      cityName = (pha as any).city.toLowerCase().trim();
    }
    if ((pha as any).state) {
      stateCode = (pha as any).state.toLowerCase().trim();
    }
    
    // If not, parse from address
    if (!cityName && pha.address) {
      // Clean up "nan" placeholder in addresses
      let cleanAddress = pha.address;
      if (cleanAddress.toLowerCase().startsWith('nan,')) {
        cleanAddress = cleanAddress.substring(4).trim();
      }
      
      // Parse address in format: "Street, City, State, Zip" or "City, State, Zip"
      const addressParts = cleanAddress.split(',').map((part: string) => part.trim());
      
      if (addressParts.length >= 2) {
        // Find the state/zip part (format: "ST 12345")
        for (let i = addressParts.length - 1; i >= 0; i--) {
          const part = addressParts[i];
          const stateZipMatch = part.match(/^([A-Z]{2})\s+\d{5}(-\d{4})?$/);
          
          if (stateZipMatch) {
            if (!stateCode) {
              stateCode = stateZipMatch[1].toLowerCase();
            }
            // City is the part before state/zip
            if (!cityName && i > 0) {
              cityName = addressParts[i - 1].toLowerCase().trim();
            }
            break;
          }
        }
      }
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
