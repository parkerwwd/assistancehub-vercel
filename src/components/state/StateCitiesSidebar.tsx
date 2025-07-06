
import React from 'react';
import { MapPin, Building2 } from 'lucide-react';
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
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          Cities in {stateName}
        </CardTitle>
        <CardDescription className="text-sm">Cities with housing authorities</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topCities.length > 0 ? topCities.map((city, index) => (
            <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm mb-1">{city.name}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Building2 className="w-3 h-3" />
                    <span>{city.properties} authorities</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 text-sm">{city.units}</div>
                  <div className="text-xs text-gray-500">est. units</div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium mb-1 text-gray-600">No Cities Found</p>
              <p className="text-xs text-gray-500">No PHA offices found in {stateName}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
