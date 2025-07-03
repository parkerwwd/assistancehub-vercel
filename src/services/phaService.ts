
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
  
  let allResults: any[] = [];
  
  if (cityStateMatch) {
    // Handle city, state format with prioritized search
    const city = cityStateMatch[1].trim();
    const state = cityStateMatch[2].trim().toUpperCase();
    
    console.log('🏙️ Parsed city/state:', { city, state });
    
    // Priority 1: Exact city and state match
    const exactMatch = await supabase
      .from('pha_agencies')
      .select('*')
      .ilike('city', city)
      .ilike('state', state)
      .limit(50);

    if (exactMatch.data && exactMatch.data.length > 0) {
      console.log('✅ Found exact city/state matches:', exactMatch.data.length);
      allResults = exactMatch.data;
    } else {
      // Priority 2: City in address AND state match
      const addressCityMatch = await supabase
        .from('pha_agencies')
        .select('*')
        .ilike('address', `%${city}%`)
        .ilike('state', state)
        .limit(50);

      if (addressCityMatch.data && addressCityMatch.data.length > 0) {
        console.log('✅ Found address/state matches:', addressCityMatch.data.length);
        allResults = addressCityMatch.data;
      } else {
        // Priority 3: Broader search within the state
        const [cityResults, addressResults] = await Promise.all([
          supabase
            .from('pha_agencies')
            .select('*')
            .ilike('city', `%${city}%`)
            .ilike('state', state)
            .limit(30),
          supabase
            .from('pha_agencies')
            .select('*')
            .ilike('address', `%${city}%`)
            .ilike('state', state)
            .limit(30)
        ]);

        const combinedResults = [
          ...(cityResults.data || []),
          ...(addressResults.data || [])
        ];

        // Remove duplicates
        allResults = combinedResults.filter((item, index, arr) => 
          arr.findIndex(other => other.id === item.id) === index
        );

        console.log('✅ Found broader matches:', allResults.length);
      }
    }
  } else {
    // Single term search - prioritize exact matches
    console.log('🔍 Single term search for:', searchTerm);
    
    // Priority 1: Exact city match
    const exactCityMatch = await supabase
      .from('pha_agencies')
      .select('*')
      .ilike('city', searchTerm)
      .limit(50);

    if (exactCityMatch.data && exactCityMatch.data.length > 0) {
      console.log('✅ Found exact city matches:', exactCityMatch.data.length);
      allResults = exactCityMatch.data;
    } else {
      // Priority 2: Address contains the search term
      const addressMatch = await supabase
        .from('pha_agencies')
        .select('*')
        .ilike('address', `%${searchTerm}%`)
        .limit(50);

      if (addressMatch.data && addressMatch.data.length > 0) {
        console.log('✅ Found address matches:', addressMatch.data.length);
        allResults = addressMatch.data;
      } else {
        // Priority 3: Broader search across relevant fields
        const [nameResults, cityResults, stateResults] = await Promise.all([
          supabase
            .from('pha_agencies')
            .select('*')
            .ilike('name', `%${searchTerm}%`)
            .limit(30),
          supabase
            .from('pha_agencies')
            .select('*')
            .ilike('city', `%${searchTerm}%`)
            .limit(30),
          supabase
            .from('pha_agencies')
            .select('*')
            .ilike('state', `%${searchTerm}%`)
            .limit(30)
        ]);

        const combinedResults = [
          ...(nameResults.data || []),
          ...(cityResults.data || []),
          ...(stateResults.data || [])
        ];

        // Remove duplicates
        allResults = combinedResults.filter((item, index, arr) => 
          arr.findIndex(other => other.id === item.id) === index
        );

        console.log('✅ Found broader matches:', allResults.length);
      }
    }
  }

  console.log('🔄 Search completed:', {
    searchTerm,
    totalResults: allResults.length,
    sampleResults: allResults.slice(0, 3).map(r => ({ 
      name: r.name, 
      city: r.city, 
      state: r.state, 
      address: r.address 
    }))
  });

  // Add geocoded coordinates for PHAs that don't have them
  const geocodedResults = await geocodePHAs(allResults);

  // Filter by bounds if provided
  let finalResults = geocodedResults;
  if (bounds) {
    finalResults = filterPHAsByBounds(geocodedResults, bounds);
    console.log('🗺️ Filtered by bounds:', {
      originalCount: geocodedResults.length,
      filteredCount: finalResults.length,
      bounds
    });
  }

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const paginatedResults = finalResults.slice(from, to + 1);
  
  return {
    data: paginatedResults,
    count: finalResults.length
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
