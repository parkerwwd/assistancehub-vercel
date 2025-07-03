import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { sanitizeSearchInput } from "@/utils/inputSanitization";
import { geocodePHAs, GeocodedPHA } from "./geocodingService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface FetchPHADataResult {
  data: GeocodedPHA[];
  count: number;
}

export interface SearchBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const fetchPHAData = async (page = 1, itemsPerPage = 20): Promise<FetchPHADataResult> => {
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, error: fetchError, count } = await supabase
    .from('pha_agencies')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to);

  if (fetchError) {
    throw fetchError;
  }

  console.log('✅ fetchPHAData successful:', {
    dataLength: data?.length || 0,
    totalCount: count,
    sampleRecord: data?.[0]
  });

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedData = await geocodePHAs(data || []);

  return {
    data: geocodedData,
    count: count || 0
  };
};

const filterPHAsByBounds = (phas: GeocodedPHA[], bounds: SearchBounds): GeocodedPHA[] => {
  return phas.filter(pha => {
    const lat = pha.latitude || pha.geocoded_latitude;
    const lng = pha.longitude || pha.geocoded_longitude;
    
    if (!lat || !lng) return false;
    
    return lat >= bounds.south && 
           lat <= bounds.north && 
           lng >= bounds.west && 
           lng <= bounds.east;
  });
};

export const searchPHAs = async (
  query: string, 
  page = 1, 
  itemsPerPage = 20, 
  bounds?: SearchBounds
): Promise<FetchPHADataResult> => {
  if (!query.trim()) {
    return await fetchPHAData(page, itemsPerPage);
  }

  // Sanitize search input to prevent injection attacks
  const searchTerm = sanitizeSearchInput(query.toLowerCase());
  console.log('🔍 Starting search for:', searchTerm);

  // Parse city/state combination (e.g., "Phoenix, AZ" or "Phoenix Arizona")
  const cityStatePattern = /^(.+?),?\s+(a[lkszrz]|c[aot]|d[ce]|fl|ga|hi|i[adln]|k[sy]|la|m[adeinost]|n[cdehjmvy]|o[hkr]|p[ar]|ri|s[cd]|t[nx]|ut|v[ait]|w[aivy])$/i;
  const cityStateMatch = searchTerm.match(cityStatePattern);
  
  let searchResults: any[];
  
  if (cityStateMatch) {
    // Handle city, state format - search in multiple fields including address
    const city = cityStateMatch[1].trim();
    const state = cityStateMatch[2].trim().toUpperCase();
    
    console.log('🏙️ Parsed city/state:', { city, state });
    
    const [addressResult, phoneResult, nameResult, cityResult, stateResult] = await Promise.all([
      // Search for city in address field
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('address', `%${city}%`)
        .limit(100),
      
      // Search for city in phone field (where city names are sometimes stored)
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('phone', `%${city}%`)
        .limit(100),
      
      // Search for city name in PHA name
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('name', `%${city}%`)
        .limit(100),
        
      // Search for city in actual city field
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('city', `%${city}%`)
        .limit(100),
        
      // Search by state
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('state', `%${state}%`)
        .limit(100)
    ]);

    searchResults = [addressResult, phoneResult, nameResult, cityResult, stateResult];
  } else {
    // Regular search for single terms - search across all relevant fields
    const [nameResult, addressResult, phoneResult, cityResult, stateResult] = await Promise.all([
      // Name search
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(100),

      // Address search
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('address', `%${searchTerm}%`)
        .limit(100),

      // Phone field search (where city names are sometimes stored)
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('phone', `%${searchTerm}%`)
        .limit(100),
        
      // City search
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('city', `%${searchTerm}%`)
        .limit(100),
        
      // State search
      supabase
        .from('pha_agencies')
        .select('*')
        .ilike('state', `%${searchTerm}%`)
        .limit(100)
    ]);

    searchResults = [nameResult, addressResult, phoneResult, cityResult, stateResult];
  }

  // Log search results for debugging
  console.log('🔍 Search results:', {
    totalQueries: searchResults.length,
    results: searchResults.map((result, index) => ({
      index,
      count: result.data?.length || 0,
      error: result.error
    }))
  });

  // Check for errors in any of the searches
  if (searchResults.some(result => result.error)) {
    console.error('Search errors:', searchResults.filter(result => result.error));
    throw new Error('Search failed due to database error');
  }

  // Combine all results
  const allResults = searchResults.flatMap(result => result.data || []);

  // Remove duplicates based on ID
  let uniqueResults = allResults.filter((item, index, arr) => 
    arr.findIndex(other => other.id === item.id) === index
  );

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedResults = await geocodePHAs(uniqueResults);

  // Filter by bounds if provided
  if (bounds) {
    uniqueResults = filterPHAsByBounds(geocodedResults, bounds);
    console.log('🗺️ Filtered by bounds:', {
      originalCount: geocodedResults.length,
      filteredCount: uniqueResults.length,
      bounds
    });
  } else {
    uniqueResults = geocodedResults;
  }

  console.log('🔄 Combined search results:', {
    totalBeforeDedup: allResults.length,
    totalAfterDedup: uniqueResults.length,
    sampleResults: uniqueResults.slice(0, 3).map(r => ({ name: r.name, address: r.address, city: r.city, phone: r.phone }))
  });

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const paginatedResults = uniqueResults.slice(from, to + 1);
  
  return {
    data: paginatedResults,
    count: uniqueResults.length
  };
};

export const getPHAsByState = async (state: string, page = 1, itemsPerPage = 20): Promise<FetchPHADataResult> => {
  const sanitizedState = sanitizeSearchInput(state);
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  
  const { data, error: fetchError, count } = await supabase
    .from('pha_agencies')
    .select('*', { count: 'exact' })
    .eq('state', sanitizedState.toUpperCase())
    .order('name')
    .range(from, to);

  if (fetchError) {
    throw fetchError;
  }

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedData = await geocodePHAs(data || []);

  return {
    data: geocodedData,
    count: count || 0
  };
};
