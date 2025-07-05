
// Re-export everything from the expanded locations file for backwards compatibility
export type { USLocation } from './expandedUSLocations';
export { 
  usStates, 
  comprehensiveCities as usCitiesAsLocations,
  majorCounties as usCounties,
  allUSLocations 
} from './expandedUSLocations';
