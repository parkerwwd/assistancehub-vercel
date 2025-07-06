
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface City {
  name: string;
  units: string;
  properties: string;
  population: string;
  waitTime: string;
}

interface StateCitiesSidebarProps {
  topCities: City[];
  stateName: string;
}

const StateCitiesSidebar: React.FC<StateCitiesSidebarProps> = ({ topCities, stateName }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Cities in {stateName}
        </CardTitle>
        <CardDescription className="text-sm">Cities with housing authorities</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topCities.length > 0 ? topCities.map((city, index) => (
            <div key={index} className="group p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{city.name}</div>
                  <div className="text-xs text-gray-600">{city.properties} authorities</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600 text-sm">{city.units}</div>
                  <div className="text-xs text-gray-500">est. units</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Pop: {city.population}</span>
                <span className="text-orange-600 font-medium">~{city.waitTime}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">No Cities Found</p>
              <p className="text-xs">No PHA offices found in {stateName}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
