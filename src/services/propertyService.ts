import { supabase } from "@/integrations/supabase/client";
import { Property, PropertyFilters } from "@/types/property";
import { USLocation } from "@/data/locations";

interface FetchPropertiesParams {
  location?: USLocation;
  filters?: PropertyFilters;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  page?: number;
  limit?: number;
}

interface PropertyServiceResult {
  data: Property[];
  error: Error | null;
  count: number;
  hasMore?: boolean;
}

export const fetchAllProperties = async (): Promise<PropertyServiceResult> => {
  try {
    console.log('📡 Fetching all properties from Supabase...');
    
    // First, get a count of all properties (with and without coordinates)
    const { count: totalCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    const { data, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return { data: [], error, count: 0 };
    }

    console.log(`✅ Property fetch results:`, {
      totalProperties: totalCount || 0,
      withCoordinates: data?.length || 0,
      withoutCoordinates: (totalCount || 0) - (data?.length || 0),
      percentage: totalCount ? ((data?.length || 0) / totalCount * 100).toFixed(1) + '%' : '0%'
    });
    
    return { data: data || [], error: null, count: count || 0 };
  } catch (error) {
    console.error('❌ Unexpected error fetching properties:', error);
    return { data: [], error: error as Error, count: 0 };
  }
};

export const fetchPropertiesByLocation = async ({ 
  location, 
  filters,
  bounds,
  page = 1,
  limit = 100 // Limit to 100 properties per request
}: FetchPropertiesParams): Promise<PropertyServiceResult> => {
  try {
    console.log('📡 Fetching properties with params:', { 
      location: location ? `${location.name}, ${location.stateCode} (${location.type})` : 'none',
      bounds: bounds ? `N:${bounds.north.toFixed(2)} S:${bounds.south.toFixed(2)} E:${bounds.east.toFixed(2)} W:${bounds.west.toFixed(2)}` : 'none',
      page, 
      limit 
    });
    
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply location filters
    if (location) {
      if (location.type === 'state') {
        query = query.eq('state', location.stateCode);
        console.log('🔍 Filtering by state:', location.stateCode);
      } else if (location.type === 'city') {
        // For cities, just use bounds filtering instead of exact city match
        // This avoids issues with city name mismatches
        console.log('🔍 City search - using bounds filtering for:', location.name);
      } else if (location.type === 'county') {
        query = query.eq('state', location.stateCode);
        console.log('🔍 Filtering by county in state:', location.stateCode);
        // Note: We don't have county data in properties table yet
      }
    }

    // Apply bounds filter for map viewport
    if (bounds) {
      query = query
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east);
      console.log('📍 Applied bounds filter');
    }

    // Apply property filters
    if (filters) {
      if (filters.propertyType && filters.propertyType.length > 0) {
        query = query.in('property_type', filters.propertyType);
      }
      
      if (filters.onlyAvailable) {
        query = query.gt('units_available', 0);
      }
      
      if (filters.minRent !== undefined) {
        query = query.gte('rent_range_min', filters.minRent);
      }
      
      if (filters.maxRent !== undefined) {
        query = query.lte('rent_range_max', filters.maxRent);
      }
      
      // Bedroom type filter (contains any of the selected types)
      if (filters.bedroomTypes && filters.bedroomTypes.length > 0) {
        query = query.contains('bedroom_types', filters.bedroomTypes);
      }
      
      // Amenities filter (has all selected amenities)
      if (filters.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', filters.amenities);
      }
      
      // Accessibility features filter
      if (filters.accessibilityFeatures && filters.accessibilityFeatures.length > 0) {
        query = query.contains('accessibility_features', filters.accessibilityFeatures);
      }
    }

    // Sort by name for consistent ordering
    query = query.order('name');

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return { data: [], error, count: 0 };
    }

    const hasMore = count ? count > (page * limit) : false;

    console.log(`✅ Property query results:`, {
      found: data?.length || 0,
      total: count || 0,
      page,
      hasMore,
      firstProperty: data && data.length > 0 ? {
        name: data[0].name,
        city: data[0].city,
        state: data[0].state,
        coords: [data[0].latitude, data[0].longitude]
      } : 'none'
    });
    
    return { data: data || [], error: null, count: count || 0, hasMore };
  } catch (error) {
    console.error('❌ Unexpected error fetching properties:', error);
    return { data: [], error: error as Error, count: 0 };
  }
};

export const fetchPropertyById = async (id: string): Promise<{ data: Property | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching property:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('❌ Unexpected error fetching property:', error);
    return { data: null, error: error as Error };
  }
};

// Calculate distance between two coordinates in miles
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Filter properties by distance from a location
export const filterPropertiesByDistance = (
  properties: Property[],
  centerLat: number,
  centerLon: number,
  maxDistanceMiles: number
): Property[] => {
  return properties.filter(property => {
    if (!property.latitude || !property.longitude) return false;
    const distance = calculateDistance(
      centerLat,
      centerLon,
      property.latitude,
      property.longitude
    );
    return distance <= maxDistanceMiles;
  });
}; 