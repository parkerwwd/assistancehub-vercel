export interface USLocation {
  name: string;
  type: 'state' | 'county' | 'city';
  state?: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
}

// US States and Territories
export const usStates: USLocation[] = [
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
  { name: "Kansas", type: "state", stateCode: "KS", latitude: 38.5266, longitude: -96.7265 },
  { name: "Kentucky", type: "state", stateCode: "KY", latitude: 37.8393, longitude: -84.2700 },
  { name: "Louisiana", type: "state", stateCode: "LA", latitude: 31.2448, longitude: -92.1450 },
  { name: "Maine", type: "state", stateCode: "ME", latitude: 45.2538, longitude: -69.4455 },
  { name: "Maryland", type: "state", stateCode: "MD", latitude: 39.0458, longitude: -76.6413 },
  { name: "Massachusetts", type: "state", stateCode: "MA", latitude: 42.4072, longitude: -71.3824 },
  { name: "Michigan", type: "state", stateCode: "MI", latitude: 44.3467, longitude: -85.4102 },
  { name: "Minnesota", type: "state", stateCode: "MN", latitude: 46.7296, longitude: -94.6859 },
  { name: "Mississippi", type: "state", stateCode: "MS", latitude: 32.3547, longitude: -89.3985 },
  { name: "Missouri", type: "state", stateCode: "MO", latitude: 37.9643, longitude: -91.8318 },
  { name: "Montana", type: "state", stateCode: "MT", latitude: 47.0527, longitude: -109.6333 },
  { name: "Nebraska", type: "state", stateCode: "NE", latitude: 41.4925, longitude: -99.9018 },
  { name: "Nevada", type: "state", stateCode: "NV", latitude: 38.8026, longitude: -116.4194 },
  { name: "New Hampshire", type: "state", stateCode: "NH", latitude: 43.1939, longitude: -71.5724 },
  { name: "New Jersey", type: "state", stateCode: "NJ", latitude: 40.0583, longitude: -74.4057 },
  { name: "New Mexico", type: "state", stateCode: "NM", latitude: 34.5199, longitude: -105.8701 },
  { name: "New York", type: "state", stateCode: "NY", latitude: 42.1657, longitude: -74.9481 },
  { name: "North Carolina", type: "state", stateCode: "NC", latitude: 35.7796, longitude: -80.7932 },
  { name: "North Dakota", type: "state", stateCode: "ND", latitude: 47.4501, longitude: -100.4659 },
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
  { name: "Vermont", type: "state", stateCode: "VT", latitude: 44.5588, longitude: -72.5806 },
  { name: "Virginia", type: "state", stateCode: "VA", latitude: 37.4316, longitude: -78.6569 },
  { name: "Washington", type: "state", stateCode: "WA", latitude: 47.7511, longitude: -120.7401 },
  { name: "West Virginia", type: "state", stateCode: "WV", latitude: 38.3498, longitude: -80.6547 },
  { name: "Wisconsin", type: "state", stateCode: "WI", latitude: 43.7844, longitude: -88.7879 },
  { name: "Wyoming", type: "state", stateCode: "WY", latitude: 43.0759, longitude: -107.2903 },
  // US Territories
  { name: "Puerto Rico", type: "state", stateCode: "PR", latitude: 18.2208, longitude: -66.5901 },
  { name: "US Virgin Islands", type: "state", stateCode: "VI", latitude: 18.3358, longitude: -64.8963 },
  { name: "Guam", type: "state", stateCode: "GU", latitude: 13.4443, longitude: 144.7937 },
  { name: "American Samoa", type: "state", stateCode: "AS", latitude: -14.2710, longitude: -170.1322 },
  { name: "Northern Mariana Islands", type: "state", stateCode: "MP", latitude: 17.3308, longitude: 145.3846 },
  { name: "District of Columbia", type: "state", stateCode: "DC", latitude: 38.8974, longitude: -77.0365 }
];

// Major counties (sample - you can expand this)
export const usCounties: USLocation[] = [
  { name: "Los Angeles County", type: "county", state: "California", stateCode: "CA", latitude: 34.3078, longitude: -118.2273 },
  { name: "Cook County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.8240, longitude: -87.8167 },
  { name: "Harris County", type: "county", state: "Texas", stateCode: "TX", latitude: 29.8580, longitude: -95.3918 },
  { name: "Maricopa County", type: "county", state: "Arizona", stateCode: "AZ", latitude: 33.3484, longitude: -112.4070 },
  { name: "San Diego County", type: "county", state: "California", stateCode: "CA", latitude: 33.0264, longitude: -116.7708 },
  { name: "Orange County", type: "county", state: "California", stateCode: "CA", latitude: 33.7175, longitude: -117.8311 },
  { name: "Miami-Dade County", type: "county", state: "Florida", stateCode: "FL", latitude: 25.6066, longitude: -80.4265 },
  { name: "Kings County", type: "county", state: "New York", stateCode: "NY", latitude: 40.6892, longitude: -73.9442 },
  { name: "Wayne County", type: "county", state: "Michigan", stateCode: "MI", latitude: 42.2619, longitude: -83.2910 },
  { name: "Queens County", type: "county", state: "New York", stateCode: "NY", latitude: 40.7282, longitude: -73.7949 },
  { name: "Riverside County", type: "county", state: "California", stateCode: "CA", latitude: 33.7406, longitude: -115.9917 },
  { name: "San Bernardino County", type: "county", state: "California", stateCode: "CA", latitude: 34.8391, longitude: -115.6618 },
  { name: "Clark County", type: "county", state: "Nevada", stateCode: "NV", latitude: 36.2277, longitude: -115.2640 },
  { name: "Tarrant County", type: "county", state: "Texas", stateCode: "TX", latitude: 32.8137, longitude: -97.1158 },
  { name: "Santa Clara County", type: "county", state: "California", stateCode: "CA", latitude: 37.3337, longitude: -121.8907 }
];

// Convert existing cities to new format
import { usCities } from './usCities';

export const usCitiesAsLocations: USLocation[] = usCities.map(city => ({
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
