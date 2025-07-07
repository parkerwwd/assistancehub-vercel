import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface GeocodeResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

// Geocode using Mapbox API
export const geocodeAddress = async (address: string, mapboxToken: string): Promise<GeocodeResult> => {
  if (!address || !mapboxToken) {
    return { success: false, error: 'Missing address or token' };
  }
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=US`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { success: true, latitude, longitude };
    }
    
    return { success: false, error: 'No results found' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update PHA with geocoded coordinates
export const updatePHACoordinates = async (
  phaId: string, 
  latitude: number, 
  longitude: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pha_agencies')
      .update({ 
        latitude,
        longitude
      })
      .eq('id', phaId);
    
    if (error) {
      console.error('Error updating PHA coordinates:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating PHA:', error);
    return false;
  }
};

// Geocode all PHAs missing coordinates
export const geocodeAllPHAs = async (mapboxToken: string, onProgress?: (current: number, total: number) => void) => {
  try {
    // Fetch all PHAs without coordinates
    const { data: phas, error } = await supabase
      .from('pha_agencies')
      .select('*')
      .or('latitude.is.null,longitude.is.null')
      .order('name');
    
    if (error) {
      console.error('Error fetching PHAs:', error);
      return { success: false, error: error.message };
    }
    
    if (!phas || phas.length === 0) {
      return { success: true, geocoded: 0, message: 'No PHAs need geocoding' };
    }
    
    console.log(`Found ${phas.length} PHAs without coordinates`);
    
    let geocoded = 0;
    let failed = 0;
    
    for (let i = 0; i < phas.length; i++) {
      const pha = phas[i];
      
      if (onProgress) {
        onProgress(i + 1, phas.length);
      }
      
      // Skip if no address
      if (!pha.address) {
        console.log(`⚠️ Skipping ${pha.name} - no address`);
        failed++;
        continue;
      }
      
      // Rate limiting - Mapbox allows 600 requests per minute
      if (i > 0 && i % 50 === 0) {
        console.log('⏳ Pausing for rate limit...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Build full address for better geocoding results
      let fullAddress = pha.address;
      
      // Add city and state if available
      if ((pha as any).city && (pha as any).state) {
        fullAddress = `${pha.address}, ${(pha as any).city}, ${(pha as any).state}`;
      }
      
      console.log(`📍 Geocoding ${i + 1}/${phas.length}: ${pha.name}`);
      
      const result = await geocodeAddress(fullAddress, mapboxToken);
      
      if (result.success && result.latitude && result.longitude) {
        const updated = await updatePHACoordinates(pha.id, result.latitude, result.longitude);
        
        if (updated) {
          geocoded++;
          console.log(`✅ Successfully geocoded: ${pha.name}`);
        } else {
          failed++;
          console.log(`❌ Failed to update: ${pha.name}`);
        }
      } else {
        failed++;
        console.log(`❌ Failed to geocode: ${pha.name} - ${result.error}`);
      }
    }
    
    return {
      success: true,
      total: phas.length,
      geocoded,
      failed,
      message: `Geocoded ${geocoded} out of ${phas.length} PHAs`
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 