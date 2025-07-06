import React from 'react';
import { Home, Building, MapPin, Users } from 'lucide-react';

export interface StateDataType {
  totalUnits: string;
  properties: string;
  cities: string;
  agencies: string;
  averageWaitTime: string;
  lastUpdated: string;
  occupancyRate: string;
  quickStats: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }>;
}

export interface CityType {
  name: string;
  units: string;
  properties: string;
  population: string;
  waitTime: string;
}

// Create dynamic state data based on actual PHA count
export const createStateData = (stateName: string, phaCount: number): StateDataType => {
  // Calculate estimated cities and properties based on PHA count
  const estimatedCities = Math.max(Math.floor(phaCount * 0.8), 1).toString();
  const estimatedProperties = Math.max(Math.floor(phaCount * 1.2), 1).toString();
  
  return {
    totalUnits: phaCount.toString(),
    properties: estimatedProperties,
    cities: estimatedCities,
    agencies: phaCount.toString(),
    averageWaitTime: phaCount > 20 ? '18-36 months' : phaCount > 10 ? '12-24 months' : '8-18 months',
    lastUpdated: 'December 2024',
    occupancyRate: phaCount > 15 ? '97%' : phaCount > 5 ? '94%' : '89%',
    quickStats: [
      { label: 'PHA Offices Found', value: phaCount.toString(), icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Housing Authorities', value: phaCount.toString(), icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Estimated Cities', value: estimatedCities, icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Active Programs', value: Math.max(Math.floor(phaCount / 3), 1).toString(), icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  };
};

// State-specific cities data (keeping existing mock data for cities sidebar)
const stateCitiesMap: Record<string, CityType[]> = {
  'Hawaii': [
    { name: 'Honolulu', units: '650', properties: '4', population: '345,064', waitTime: '18-30 months' },
    { name: 'Hilo', units: '280', properties: '2', population: '45,248', waitTime: '12-24 months' },
    { name: 'Kailua-Kona', units: '150', properties: '1', population: '19,713', waitTime: '15-28 months' },
    { name: 'Kaneohe', units: '120', properties: '1', population: '34,597', waitTime: '10-20 months' },
    { name: 'Waipahu', units: '100', properties: '1', population: '43,485', waitTime: '8-18 months' }
  ],
  'California': [
    { name: 'Los Angeles', units: '12,500', properties: '25', population: '3,898,747', waitTime: '24-48 months' },
    { name: 'San Francisco', units: '8,200', properties: '18', population: '873,965', waitTime: '36-60 months' },
    { name: 'San Diego', units: '6,800', properties: '15', population: '1,386,932', waitTime: '18-36 months' },
    { name: 'Oakland', units: '4,500', properties: '12', population: '440,646', waitTime: '24-42 months' },
    { name: 'Sacramento', units: '3,200', properties: '8', population: '524,943', waitTime: '12-24 months' }
  ],
  'Alaska': [
    { name: 'Anchorage', units: '450', properties: '3', population: '291,538', waitTime: '18-30 months' },
    { name: 'Fairbanks', units: '200', properties: '2', population: '31,635', waitTime: '12-24 months' },
    { name: 'Juneau', units: '150', properties: '1', population: '32,255', waitTime: '15-28 months' },
    { name: 'Sitka', units: '50', properties: '1', population: '8,458', waitTime: '8-18 months' }
  ]
};

// Legacy function - now creates dynamic data instead of using static mapping
export const getStateData = (stateName?: string, phaCount: number = 0): StateDataType => {
  if (stateName && phaCount > 0) {
    return createStateData(stateName, phaCount);
  }
  // Fallback to Hawaii data if no state name or count provided
  return createStateData('Hawaii', 8);
};

export const getTopCities = (stateName?: string): CityType[] => {
  if (stateName && stateCitiesMap[stateName]) {
    return stateCitiesMap[stateName];
  }
  // Default fallback cities
  return stateCitiesMap['Hawaii'];
};
