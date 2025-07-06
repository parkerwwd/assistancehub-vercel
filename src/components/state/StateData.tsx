
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

export const getStateData = (): StateDataType => {
  const { Home, Building, MapPin, Users } = await import('lucide-react');
  
  return {
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
  };
};

export const getTopCities = (): CityType[] => {
  return [
    {
      name: 'Anchorage',
      units: '450',
      properties: '3',
      population: '291,538',
      waitTime: '18-30 months'
    },
    {
      name: 'Fairbanks',
      units: '280',
      properties: '2',
      population: '31,635',
      waitTime: '12-24 months'
    },
    {
      name: 'Juneau',
      units: '220',
      properties: '1',
      population: '32,255',
      waitTime: '15-28 months'
    },
    {
      name: 'Wasilla',
      units: '150',
      properties: '1',
      population: '9,054',
      waitTime: '10-20 months'
    },
    {
      name: 'Sitka',
      units: '100',
      properties: '1',
      population: '8,458',
      waitTime: '8-18 months'
    },
    {
      name: 'Ketchikan',
      units: '50',
      properties: '1',
      population: '8,192',
      waitTime: '6-15 months'
    }
  ];
};
