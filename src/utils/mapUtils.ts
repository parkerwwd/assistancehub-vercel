
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const getWaitlistColor = (status: string) => {
  switch (status) {
    case "Open": return "#10b981";
    case "Limited Opening": return "#f59e0b";
    case "Closed": return "#ef4444";
    default: return "#6b7280";
  }
};

export const getPHATypeFromData = (agency: any) => {
  // First check if we have HA_PROGRAM_TYPE field
  if (agency.ha_program_type) {
    // Map various program types to our two simplified categories
    const programType = agency.ha_program_type.toLowerCase();
    if (programType.includes('combined') || programType.includes('both')) {
      return "Combined PHA";
    } else {
      return "Section 8 PHA";
    }
  }
  
  // Fallback to existing logic using supports_hcv
  if (agency.supports_hcv) {
    return "Section 8 PHA";
  } else {
    // If they don't support HCV, they likely have public housing too, so Combined
    return "Combined PHA";
  }
};

export const getPHATypeColor = (phaType: string) => {
  switch (phaType) {
    case "Combined PHA": return "#8b5cf6";
    case "Section 8 PHA": return "#3b82f6";
    default: return "#6b7280";
  }
};

/**
 * Filters PHA agencies based on the selected location from search
 * Matches against address, city, state, and zip fields
 */
export const filterPHAAgenciesByLocation = (
  agencies: PHAAgency[],
  selectedLocation: USLocation
): PHAAgency[] => {
  if (!agencies || agencies.length === 0) {
    return [];
  }

  console.log('🔍 Filtering PHA agencies for location:', selectedLocation.name, selectedLocation.type);

  const searchTerms = getLocationSearchTerms(selectedLocation);
  console.log('🔍 Search terms:', searchTerms);

  const filteredAgencies = agencies.filter(agency => {
    return searchTerms.some(term => matchesAgencyLocation(agency, term));
  });

  console.log('🔍 Filtered agencies:', filteredAgencies.length, 'out of', agencies.length);
  return filteredAgencies;
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
    agency.city,
    agency.state,
    agency.zip,
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
