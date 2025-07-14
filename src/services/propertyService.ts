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

    console.log(`✅ Fetched ${data?.length || 0} properties`);
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
    console.log('📡 Fetching properties with params:', { location, filters, bounds, page, limit });
    
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply location filters
    if (location) {
      if (location.type === 'state') {
        query = query.eq('state', location.stateCode);
      } else if (location.type === 'city') {
        query = query.eq('city', location.name).eq('state', location.stateCode);
      } else if (location.type === 'county') {
        query = query.eq('state', location.stateCode);
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
    }

    // Apply property filters
    if (filters) {
      if (filters.propertyType && filters.propertyType.length > 0) {
        query = query.in('property_type', filters.propertyType);
      }
      
      if (filters.onlyAvailable) {
        query = query.gt('units_available', 0);
      }
      
      if (filters.waitlistOpen !== undefined) {
        query = query.eq('waitlist_open', filters.waitlistOpen);
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

    console.log(`✅ Fetched ${data?.length || 0} properties for location (page ${page})`);
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