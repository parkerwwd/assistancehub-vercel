
import { PHAAgency } from "@/types/phaOffice";
import { USLocation } from "@/data/usLocations";

export const getWaitlistColor = (status: string) => {
  switch (status) {
    case "Open": return "#10b981";
    case "Limited Opening": return "#f59e0b";
    case "Closed": return "#ef4444";
    default: return "#6b7280";
  }
};

export const getPHATypeFromData = (agency: any) => {
  // Simplified for now since we don't have database data
  return "PHA Office";
};

export const getPHATypeColor = (phaType: string) => {
  switch (phaType) {
    case "Combined PHA": return "#8b5cf6";
    case "Section 8 PHA": return "#3b82f6";
    default: return "#6b7280";
  }
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
 * Filters PHA agencies based on the selected location from search
 */
export const filterPHAAgenciesByLocation = (
  agencies: PHAAgency[],
  selectedLocation: USLocation
): PHAAgency[] => {
  console.log('⚠️ Database tables removed - returning empty filtered results');
  return [];
};
