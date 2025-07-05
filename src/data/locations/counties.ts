
import { USLocation } from './types';

// Major counties from all states
export const majorCounties: USLocation[] = [
  // California Counties
  { name: "Los Angeles County", type: "county", state: "California", stateCode: "CA", latitude: 34.0522, longitude: -118.2437 },
  { name: "San Diego County", type: "county", state: "California", stateCode: "CA", latitude: 32.7157, longitude: -117.1611 },
  { name: "Orange County", type: "county", state: "California", stateCode: "CA", latitude: 33.7175, longitude: -117.8311 },
  { name: "Riverside County", type: "county", state: "California", stateCode: "CA", latitude: 33.7365, longitude: -116.2023 },
  { name: "San Bernardino County", type: "county", state: "California", stateCode: "CA", latitude: 34.8389, longitude: -116.5453 },
  { name: "Santa Clara County", type: "county", state: "California", stateCode: "CA", latitude: 37.3541, longitude: -121.9552 },
  { name: "Alameda County", type: "county", state: "California", stateCode: "CA", latitude: 37.6017, longitude: -121.7195 },
  { name: "Sacramento County", type: "county", state: "California", stateCode: "CA", latitude: 38.4747, longitude: -121.3542 },
  { name: "Contra Costa County", type: "county", state: "California", stateCode: "CA", latitude: 37.8534, longitude: -121.9018 },
  { name: "Fresno County", type: "county", state: "California", stateCode: "CA", latitude: 36.8375, longitude: -119.2871 },
  
  // Texas Counties
  { name: "Harris County", type: "county", state: "Texas", stateCode: "TX", latitude: 29.7604, longitude: -95.3698 },
  { name: "Dallas County", type: "county", state: "Texas", stateCode: "TX", latitude: 32.7767, longitude: -96.7970 },
  { name: "Tarrant County", type: "county", state: "Texas", stateCode: "TX", latitude: 32.7555, longitude: -97.3308 },
  { name: "Bexar County", type: "county", state: "Texas", stateCode: "TX", latitude: 29.4241, longitude: -98.4936 },
  { name: "Travis County", type: "county", state: "Texas", stateCode: "TX", latitude: 30.2672, longitude: -97.7431 },
  { name: "Collin County", type: "county", state: "Texas", stateCode: "TX", latitude: 33.1972, longitude: -96.6397 },
  { name: "Hidalgo County", type: "county", state: "Texas", stateCode: "TX", latitude: 26.1224, longitude: -98.2627 },
  { name: "El Paso County", type: "county", state: "Texas", stateCode: "TX", latitude: 31.7619, longitude: -106.4850 },
  { name: "Denton County", type: "county", state: "Texas", stateCode: "TX", latitude: 33.2148, longitude: -97.1331 },
  { name: "Fort Bend County", type: "county", state: "Texas", stateCode: "TX", latitude: 29.5844, longitude: -95.7066 },
  
  // Florida Counties
  { name: "Miami-Dade County", type: "county", state: "Florida", stateCode: "FL", latitude: 25.7617, longitude: -80.1918 },
  { name: "Broward County", type: "county", state: "Florida", stateCode: "FL", latitude: 26.1224, longitude: -80.1373 },
  { name: "Palm Beach County", type: "county", state: "Florida", stateCode: "FL", latitude: 26.7153, longitude: -80.0534 },
  { name: "Hillsborough County", type: "county", state: "Florida", stateCode: "FL", latitude: 27.9942, longitude: -82.4513 },
  { name: "Orange County", type: "county", state: "Florida", stateCode: "FL", latitude: 28.4158, longitude: -81.2989 },
  { name: "Pinellas County", type: "county", state: "Florida", stateCode: "FL", latitude: 27.7730, longitude: -82.6404 },
  { name: "Duval County", type: "county", state: "Florida", stateCode: "FL", latitude: 30.3322, longitude: -81.6557 },
  { name: "Lee County", type: "county", state: "Florida", stateCode: "FL", latitude: 26.6406, longitude: -81.8723 },
  { name: "Polk County", type: "county", state: "Florida", stateCode: "FL", latitude: 28.0336, longitude: -81.7479 },
  { name: "Brevard County", type: "county", state: "Florida", stateCode: "FL", latitude: 28.2639, longitude: -80.7214 },
  
  // New York Counties
  { name: "New York County", type: "county", state: "New York", stateCode: "NY", latitude: 40.7831, longitude: -73.9712 },
  { name: "Kings County", type: "county", state: "New York", stateCode: "NY", latitude: 40.6782, longitude: -73.9442 },
  { name: "Queens County", type: "county", state: "New York", stateCode: "NY", latitude: 40.7282, longitude: -73.7949 },
  { name: "Suffolk County", type: "county", state: "New York", stateCode: "NY", latitude: 40.8176, longitude: -73.1390 },
  { name: "Bronx County", type: "county", state: "New York", stateCode: "NY", latitude: 40.8448, longitude: -73.8648 },
  { name: "Nassau County", type: "county", state: "New York", stateCode: "NY", latitude: 40.7282, longitude: -73.5965 },
  { name: "Westchester County", type: "county", state: "New York", stateCode: "NY", latitude: 41.1220, longitude: -73.7949 },
  { name: "Erie County", type: "county", state: "New York", stateCode: "NY", latitude: 42.7284, longitude: -78.7279 },
  { name: "Monroe County", type: "county", state: "New York", stateCode: "NY", latitude: 43.1561, longitude: -77.6081 },
  { name: "Richmond County", type: "county", state: "New York", stateCode: "NY", latitude: 40.5795, longitude: -74.1502 },
  
  // Illinois Counties
  { name: "Cook County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.8781, longitude: -87.6298 },
  { name: "DuPage County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.8503, longitude: -88.0901 },
  { name: "Lake County", type: "county", state: "Illinois", stateCode: "IL", latitude: 42.3369, longitude: -87.8406 },
  { name: "Will County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.5067, longitude: -87.9923 },
  { name: "Kane County", type: "county", state: "Illinois", stateCode: "IL", latitude: 41.8405, longitude: -88.4487 },
  
  // Additional major counties from other states
  { name: "Maricopa County", type: "county", state: "Arizona", stateCode: "AZ", latitude: 33.4484, longitude: -112.0740 },
  { name: "Pima County", type: "county", state: "Arizona", stateCode: "AZ", latitude: 32.2217, longitude: -110.9265 },
  { name: "King County", type: "county", state: "Washington", stateCode: "WA", latitude: 47.4009, longitude: -121.5810 },
  { name: "Pierce County", type: "county", state: "Washington", stateCode: "WA", latitude: 47.2529, longitude: -122.4443 },
  { name: "Multnomah County", type: "county", state: "Oregon", stateCode: "OR", latitude: 45.5152, longitude: -122.6784 },
  { name: "Washington County", type: "county", state: "Oregon", stateCode: "OR", latitude: 45.5228, longitude: -122.9698 },
  { name: "Clark County", type: "county", state: "Nevada", stateCode: "NV", latitude: 36.1699, longitude: -115.1398 },
  { name: "Washoe County", type: "county", state: "Nevada", stateCode: "NV", latitude: 39.5296, longitude: -119.8138 },
  { name: "Jefferson County", type: "county", state: "Colorado", stateCode: "CO", latitude: 39.5501, longitude: -105.0178 },
  { name: "El Paso County", type: "county", state: "Colorado", stateCode: "CO", latitude: 38.8339, longitude: -104.8214 },
  { name: "Arapahoe County", type: "county", state: "Colorado", stateCode: "CO", latitude: 39.6503, longitude: -104.7759 },
  { name: "Adams County", type: "county", state: "Colorado", stateCode: "CO", latitude: 39.8764, longitude: -104.7688 }
];
