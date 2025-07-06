
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

// State-specific data mapping
const stateDataMap: Record<string, StateDataType> = {
  'Hawaii': {
    totalUnits: '1,250',
    properties: '8',
    cities: '6',
    agencies: '8',
    averageWaitTime: '12-24 months',
    lastUpdated: 'December 2024',
    occupancyRate: '94%',
    quickStats: [
      { label: 'Available Units', value: '1,250', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Housing Authorities', value: '8', icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Cities Served', value: '6', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Active Programs', value: '3', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  },
  'California': {
    totalUnits: '45,800',
    properties: '125',
    cities: '58',
    agencies: '95',
    averageWaitTime: '18-36 months',
    lastUpdated: 'December 2024',
    occupancyRate: '97%',
    quickStats: [
      { label: 'Available Units', value: '45,800', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Housing Authorities', value: '95', icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Cities Served', value: '58', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Active Programs', value: '12', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  },
  'Alaska': {
    totalUnits: '850',
    properties: '6',
    cities: '4',
    agencies: '5',
    averageWaitTime: '8-18 months',
    lastUpdated: 'December 2024',
    occupancyRate: '89%',
    quickStats: [
      { label: 'Available Units', value: '850', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Housing Authorities', value: '5', icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Cities Served', value: '4', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Active Programs', value: '2', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  }
};

// State-specific cities data
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

export const getStateData = (stateName?: string): StateDataType => {
  if (stateName && stateDataMap[stateName]) {
    return stateDataMap[stateName];
  }
  // Default fallback data
  return stateDataMap['Hawaii'];
};

export const getTopCities = (stateName?: string): CityType[] => {
  if (stateName && stateCitiesMap[stateName]) {
    return stateCitiesMap[stateName];
  }
  // Default fallback cities
  return stateCitiesMap['Hawaii'];
};
