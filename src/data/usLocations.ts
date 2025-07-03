
export interface USLocation {
  name: string;
  type: 'state' | 'county' | 'city';
  state?: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
}

// US Territories and DC only
export const usStates: USLocation[] = [
  // US Territories and DC
  { name: "Puerto Rico", type: "state", stateCode: "PR", latitude: 18.2208, longitude: -66.5901 },
  { name: "US Virgin Islands", type: "state", stateCode: "VI", latitude: 18.3358, longitude: -64.8963 },
  { name: "Guam", type: "state", stateCode: "GU", latitude: 13.4443, longitude: 144.7937 },
  { name: "American Samoa", type: "state", stateCode: "AS", latitude: -14.2710, longitude: -170.1322 },
  { name: "Northern Mariana Islands", type: "state", stateCode: "MP", latitude: 17.3308, longitude: 145.3846 },
  { name: "District of Columbia", type: "state", stateCode: "DC", latitude: 38.8974, longitude: -77.0365 }
];

// Major counties for territories and DC
export const usCounties: USLocation[] = [
  // Puerto Rico counties (sample)
  { name: "San Juan County", type: "county", state: "Puerto Rico", stateCode: "PR", latitude: 18.4655, longitude: -66.1057 },
  { name: "Bayamón County", type: "county", state: "Puerto Rico", stateCode: "PR", latitude: 18.3988, longitude: -66.1614 },
  { name: "Carolina County", type: "county", state: "Puerto Rico", stateCode: "PR", latitude: 18.3809, longitude: -65.9574 },
  
  // US Virgin Islands counties
  { name: "St. Thomas County", type: "county", state: "US Virgin Islands", stateCode: "VI", latitude: 18.3381, longitude: -64.8941 },
  { name: "St. John County", type: "county", state: "US Virgin Islands", stateCode: "VI", latitude: 18.3312, longitude: -64.7440 },
  { name: "St. Croix County", type: "county", state: "US Virgin Islands", stateCode: "VI", latitude: 17.7178, longitude: -64.7510 },
  
  // Guam counties
  { name: "Hagåtña County", type: "county", state: "Guam", stateCode: "GU", latitude: 13.4745, longitude: 144.7504 },
  { name: "Dededo County", type: "county", state: "Guam", stateCode: "GU", latitude: 13.5158, longitude: 144.8386 }
];

// Convert existing cities to new format, filtering for territories and DC only
import { usCities } from './usCities';

const allowedStateCodes = ['PR', 'VI', 'GU', 'AS', 'MP', 'DC'];

export const usCitiesAsLocations: USLocation[] = usCities
  .filter(city => allowedStateCodes.includes(city.stateCode))
  .map(city => ({
    name: city.name,
    type: 'city' as const,
    state: city.state,
    stateCode: city.stateCode,
    latitude: city.latitude,
    longitude: city.longitude
  }));

// Combined locations
export const allUSLocations: USLocation[] = [
  ...usStates,
  ...usCounties,
  ...usCitiesAsLocations
];
