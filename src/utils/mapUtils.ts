import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface PHAAgencyWithDistance extends PHAAgency {
  _distance?: number;
  _isExactMatch?: boolean;
}

export const getWaitlistColor = (status: string) => {
  switch (status) {
    case "Open": return "#10b981";
    case "Limited Opening": return "#f59e0b";
    case "Closed": return "#ef4444";
    default: return "#6b7280";
  }
};

export const getPHATypeFromData = (agency: any) => {
  // Check if we have program_type field
  if (agency.program_type) {
    const programType = agency.program_type.toLowerCase();
    if (programType.includes('combined')) {
      return "Combined PHA";
    } else if (programType.includes('section 8')) {
      return "Section 8 PHA";
    } else if (programType.includes('low-rent')) {
      return "Low-Rent PHA";
    }
  }
  
  // Fallback to existing logic using section8_units_count
  if (agency.section8_units_count && agency.section8_units_count > 0) {
    return "Section 8 PHA";
  } else {
    // Default fallback
    return "Combined PHA";
  }
};

export const getPHATypeColor = (phaType: string) => {
  if (!phaType) return "#6b7280";
  
  const typeToCheck = phaType.toLowerCase();
  
  // Handle both raw database values and formatted display values
  if (typeToCheck.includes('combined')) {
    return "#a855f7"; // Purple-500 - vibrant purple for Combined
  } else if (typeToCheck.includes('section 8') || typeToCheck.includes('section8')) {
    return "#3b82f6"; // Blue-500 - blue for Section 8
  } else if (typeToCheck.includes('low-rent') || typeToCheck.includes('lowrent')) {
    return "#10b981"; // Emerald-500 - green for Low-Rent
  }
  
  // Default fallback
  return "#6b7280"; // Gray-500
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

/**
 * Enhanced state filtering that matches agencies by state name or abbreviation
 */
const filterByStateName = (agencies: PHAAgency[], stateName: string): PHAAgencyWithDistance[] => {
  const stateNameLower = stateName.toLowerCase();
  
  // Common state abbreviations mapping
  const stateAbbreviations: Record<string, string> = {
    'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar', 'california': 'ca',
    'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de', 'florida': 'fl', 'georgia': 'ga',
    'hawaii': 'hi', 'idaho': 'id', 'illinois': 'il', 'indiana': 'in', 'iowa': 'ia',
    'kansas': 'ks', 'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
    'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms', 'missouri': 'mo',
    'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv', 'new hampshire': 'nh', 'new jersey': 'nj',
    'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh',
    'oklahoma': 'ok', 'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
    'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut', 'vermont': 'vt',
    'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv', 'wisconsin': 'wi', 'wyoming': 'wy'
  };
  
  const stateAbbr = stateAbbreviations[stateNameLower];
  
  return agencies.filter(agency => {
    if (!agency.address) return false;
    
    const addressLower = agency.address.toLowerCase();
    
    // Check for full state name
    if (addressLower.includes(stateNameLower)) {
      return true;
    }
    
    // Check for state abbreviation (with word boundaries to avoid false matches)
    if (stateAbbr) {
      const abbrevRegex = new RegExp(`\\b${stateAbbr}\\b`, 'i');
      if (abbrevRegex.test(agency.address)) {
        return true;
      }
    }
    
    return false;
  }) as PHAAgencyWithDistance[];
};

/**
 * Filters PHA agencies based on the selected location from search
 * - For states: matches agencies using state name and abbreviation
 * - For cities: matches all agencies within 25 miles of the city
 * - For counties: matches agencies in that county and state
 */
export const filterPHAAgenciesByLocation = (
  agencies: PHAAgency[],
  selectedLocation: USLocation
): PHAAgencyWithDistance[] => {
  console.warn('🔍 filterPHAAgenciesByLocation called');
  console.warn('🔍 agencies count:', agencies.length);
  console.warn('🔍 selectedLocation:', selectedLocation);
  
  if (!agencies || agencies.length === 0) {
    return [];
  }

  if (selectedLocation.type === 'state') {
    // Enhanced state filtering
    const filteredAgencies = filterByStateName(agencies, selectedLocation.name);
    console.warn('🔍 State filter result count:', filteredAgencies.length);
    return filteredAgencies;
  }

  if (selectedLocation.type === 'city') {
    console.warn('🔍 Filtering by city within 25 miles');
    
    // Check first agency to see what fields are available
    if (agencies.length > 0) {
      console.warn('🔍 First agency sample:', {
        name: agencies[0].name,
        address: agencies[0].address,
        latitude: agencies[0].latitude,
        longitude: agencies[0].longitude,
        geocoded_latitude: (agencies[0] as any).geocoded_latitude,
        geocoded_longitude: (agencies[0] as any).geocoded_longitude,
      });
    }
    
    // For cities, show all agencies within 25 miles, sorted by distance
    const agenciesWithDistance = agencies
      .map(agency => {
        // Get agency coordinates - prefer database coordinates, fall back to geocoded ones
        let agencyLat = agency.latitude;
        let agencyLng = agency.longitude;
        
        // If database doesn't have coordinates, check for geocoded ones
        if (!agencyLat || !agencyLng) {
          const geocodedAgency = agency as any;
          agencyLat = geocodedAgency.geocoded_latitude;
          agencyLng = geocodedAgency.geocoded_longitude;
        }
        
        // Skip agencies without any coordinates
        if (!agencyLat || !agencyLng) {
          return null;
        }
        
        // Calculate distance
        const distance = calculateDistance(
          selectedLocation.latitude,
          selectedLocation.longitude,
          agencyLat,
          agencyLng
        );
        
        // Check if it's within range
        if (distance > 25) {
          return null;
        }
        
        // Check if agency name or address contains the exact city name
        const cityNameLower = selectedLocation.name.toLowerCase();
        const isExactMatch = 
          agency.name?.toLowerCase().includes(cityNameLower) ||
          agency.address?.toLowerCase().includes(cityNameLower);
        
        return { agency, distance, isExactMatch };
      })
      .filter(item => item !== null) as Array<{ agency: PHAAgency; distance: number; isExactMatch: boolean }>;

    console.warn('🔍 Agencies within 25 miles:', agenciesWithDistance.length);

    // Sort by: 1) Exact match first, 2) Distance (closest first)
    agenciesWithDistance.sort((a, b) => {
      // Prioritize exact matches
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;
      
      // Then sort by distance
      return a.distance - b.distance;
    });

    const filteredAgencies = agenciesWithDistance.map(item => {
      return {
        ...item.agency,
        _distance: item.distance,
        _isExactMatch: item.isExactMatch
      } as PHAAgencyWithDistance;
    });

    console.warn('🔍 Final filtered count:', filteredAgencies.length);
    return filteredAgencies;
  }

  if (selectedLocation.type === 'county') {
    // For counties, match by county name and state
    const searchTerms = getLocationSearchTerms(selectedLocation);

    const filteredAgencies = agencies.filter(agency => {
      return searchTerms.some(term => matchesAgencyLocation(agency, term));
    }) as PHAAgencyWithDistance[];

    return filteredAgencies;
  }

  // Fallback to original logic
  const searchTerms = getLocationSearchTerms(selectedLocation);

  const filteredAgencies = agencies.filter(agency => {
    return searchTerms.some(term => matchesAgencyLocation(agency, term));
  }) as PHAAgencyWithDistance[];

  return filteredAgencies;
};

/**
 * Filter PHA agencies by state name directly (for state page integration)
 */
export const filterPHAAgenciesByState = (
  agencies: PHAAgency[],
  stateName: string
): PHAAgencyWithDistance[] => {
  if (!agencies || agencies.length === 0 || !stateName) {
    return [];
  }

  return filterByStateName(agencies, stateName);
};

/**
 * Generate search terms based on the selected location type
 */
const getLocationSearchTerms = (location: USLocation): string[] => {
  const terms: string[] = [];

  switch (location.type) {
    case 'state':
      // For states, search by state name and state code
      terms.push(location.name.toLowerCase());
      if (location.stateCode) {
        terms.push(location.stateCode.toLowerCase());
      }
      break;

    case 'county':
      // For counties, search by county name and state
      terms.push(location.name.toLowerCase());
      if (location.stateCode) {
        terms.push(location.stateCode.toLowerCase());
      }
      // Also try without "County" suffix
      const countyNameWithoutSuffix = location.name.replace(/\s+county$/i, '').toLowerCase();
      if (countyNameWithoutSuffix !== location.name.toLowerCase()) {
        terms.push(countyNameWithoutSuffix);
      }
      break;

    case 'city':
      // For cities, search by city name and state
      terms.push(location.name.toLowerCase());
      if (location.stateCode) {
        terms.push(location.stateCode.toLowerCase());
      }
      break;
  }

  return terms;
};

/**
 * Check if a PHA agency matches a search term in its location fields
 */
const matchesAgencyLocation = (agency: PHAAgency, searchTerm: string): boolean => {
  const fieldsToSearch = [
    agency.address,
    // Also check phone field as it sometimes contains city info
    agency.phone
  ];

  return fieldsToSearch.some(field => {
    if (!field) return false;
    const fieldLower = field.toLowerCase();
    const termLower = searchTerm.toLowerCase();

    // For state codes (2 letters), do exact word matching to avoid false positives
    if (termLower.length === 2 && /^[a-z]{2}$/.test(termLower)) {
      // Split field into words and check for exact match
      const words = fieldLower.split(/\s+|,|\.|;/);
      return words.some(word => word === termLower);
    }

    // For longer terms, use contains matching
    return fieldLower.includes(termLower);
  });
};
