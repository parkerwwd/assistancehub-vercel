
export interface USLocation {
  name: string;
  type: 'state' | 'county' | 'city';
  state?: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
}

// All US States including territories and DC
export const usStates: USLocation[] = [
  // Mainland US States
  { name: "Alabama", type: "state", stateCode: "AL", latitude: 32.3617, longitude: -86.2792 },
  { name: "Alaska", type: "state", stateCode: "AK", latitude: 64.0685, longitude: -152.2782 },
  { name: "Arizona", type: "state", stateCode: "AZ", latitude: 34.2744, longitude: -111.2847 },
  { name: "Arkansas", type: "state", stateCode: "AR", latitude: 34.7519, longitude: -92.1313 },
  { name: "California", type: "state", stateCode: "CA", latitude: 36.7783, longitude: -119.4179 },
  { name: "Colorado", type: "state", stateCode: "CO", latitude: 39.5501, longitude: -105.7821 },
  { name: "Connecticut", type: "state", stateCode: "CT", latitude: 41.6032, longitude: -73.0877 },
  { name: "Delaware", type: "state", stateCode: "DE", latitude: 38.9108, longitude: -75.5277 },
  { name: "Florida", type: "state", stateCode: "FL", latitude: 27.7663, longitude: -81.6868 },
  { name: "Georgia", type: "state", stateCode: "GA", latitude: 32.1656, longitude: -82.9001 },
  { name: "Hawaii", type: "state", stateCode: "HI", latitude: 19.8968, longitude: -155.5828 },
  { name: "Idaho", type: "state", stateCode: "ID", latitude: 44.0682, longitude: -114.7420 },
  { name: "Illinois", type: "state", stateCode: "IL", latitude: 40.6331, longitude: -89.3985 },
  { name: "Indiana", type: "state", stateCode: "IN", latitude: 40.2732, longitude: -86.1349 },
  { name: "Iowa", type: "state", stateCode: "IA", latitude: 41.8780, longitude: -93.0977 },
  { name: "Kansas", type: "state", stateCode: "KS", latitude: 38.5767, longitude: -96.6917 },
  { name: "Kentucky", type: "state", stateCode: "KY", latitude: 37.8393, longitude: -84.2700 },
  { name: "Louisiana", type: "state", stateCode: "LA", latitude: 31.2444, longitude: -92.1458 },
  { name: "Maine", type: "state", stateCode: "ME", latitude: 45.2538, longitude: -69.4455 },
  { name: "Maryland", type: "state", stateCode: "MD", latitude: 39.0458, longitude: -76.6413 },
  { name: "Massachusetts", type: "state", stateCode: "MA", latitude: 42.4072, longitude: -71.3824 },
  { name: "Michigan", type: "state", stateCode: "MI", latitude: 44.3467, longitude: -85.4102 },
  { name: "Minnesota", type: "state", stateCode: "MN", latitude: 46.7296, longitude: -94.6859 },
  { name: "Mississippi", type: "state", stateCode: "MS", latitude: 32.3544, longitude: -89.3985 },
  { name: "Missouri", type: "state", stateCode: "MO", latitude: 37.9643, longitude: -91.8318 },
  { name: "Montana", type: "state", stateCode: "MT", latitude: 47.0527, longitude: -109.6333 },
  { name: "Nebraska", type: "state", stateCode: "NE", latitude: 41.4925, longitude: -99.9018 },
  { name: "Nevada", type: "state", stateCode: "NV", latitude: 38.8026, longitude: -116.4194 },
  { name: "New Hampshire", type: "state", stateCode: "NH", latitude: 43.1939, longitude: -71.5724 },
  { name: "New Jersey", type: "state", stateCode: "NJ", latitude: 40.0583, longitude: -74.4057 },
  { name: "New Mexico", type: "state", stateCode: "NM", latitude: 34.5199, longitude: -105.8701 },
  { name: "New York", type: "state", stateCode: "NY", latitude: 40.7589, longitude: -73.9851 },
  { name: "North Carolina", type: "state", stateCode: "NC", latitude: 35.7596, longitude: -79.0193 },
  { name: "North Dakota", type: "state", stateCode: "ND", latitude: 47.5515, longitude: -101.0020 },
  { name: "Ohio", type: "state", stateCode: "OH", latitude: 40.4173, longitude: -82.9071 },
  { name: "Oklahoma", type: "state", stateCode: "OK", latitude: 35.0078, longitude: -97.0929 },
  { name: "Oregon", type: "state", stateCode: "OR", latitude: 43.8041, longitude: -120.5542 },
  { name: "Pennsylvania", type: "state", stateCode: "PA", latitude: 41.2033, longitude: -77.1945 },
  { name: "Rhode Island", type: "state", stateCode: "RI", latitude: 41.6809, longitude: -71.5118 },
  { name: "South Carolina", type: "state", stateCode: "SC", latitude: 33.8361, longitude: -81.1637 },
  { name: "South Dakota", type: "state", stateCode: "SD", latitude: 43.9695, longitude: -99.9018 },
  { name: "Tennessee", type: "state", stateCode: "TN", latitude: 35.5175, longitude: -86.5804 },
  { name: "Texas", type: "state", stateCode: "TX", latitude: 31.9686, longitude: -99.9018 },
  { name: "Utah", type: "state", stateCode: "UT", latitude: 39.3210, longitude: -111.0937 },
  { name: "Vermont", type: "state", stateCode: "VT", latitude: 44.5588, longitude: -72.5805 },
  { name: "Virginia", type: "state", stateCode: "VA", latitude: 37.4316, longitude: -78.6569 },
  { name: "Washington", type: "state", stateCode: "WA", latitude: 47.7511, longitude: -120.7401 },
  { name: "West Virginia", type: "state", stateCode: "WV", latitude: 38.5976, longitude: -80.4549 },
  { name: "Wisconsin", type: "state", stateCode: "WI", latitude: 43.7844, longitude: -88.7879 },
  { name: "Wyoming", type: "state", stateCode: "WY", latitude: 42.7475, longitude: -107.2085 },
  
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
  { name: "Dededo County", type: "county", state: "Guam", stateCode: "GU", latitude: 13.5158, longitude: 144.8386 },
  
  // Sample major counties from mainland states
  { name: "Los Angeles County", type: "county", state: "California", stateCode: "CA", latitude: 34.0522, longitude: -118.2437 },
  { name: "Cook County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.8781, longitude: -87.6298 },
  { name: "Harris County", type: "county", state: "Texas", stateCode: "TX", latitude: 29.7604, longitude: -95.3698 },
  { name: "Maricopa County", type: "county", state: "Arizona", stateCode: "AZ", latitude: 33.4484, longitude: -112.0740 },
  { name: "Miami-Dade County", type: "county", state: "Florida", stateCode: "FL", latitude: 25.7617, longitude: -80.1918 }
];

// Convert existing cities to new format, now including ALL states
import { usCities } from './usCities';

export const usCitiesAsLocations: USLocation[] = usCities.map(city => ({
  name: city.name,
  type: 'city' as const,
  state: city.state,
  stateCode: city.stateCode,
  latitude: city.latitude,
  longitude: city.longitude
}));

// Combined locations - now includes all US states, territories, counties, and cities
export const allUSLocations: USLocation[] = [
  ...usStates,
  ...usCounties,
  ...usCitiesAsLocations
];
