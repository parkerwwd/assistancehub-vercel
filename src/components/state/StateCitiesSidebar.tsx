
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
        <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Cities in {stateName}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Cities with housing authorities
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topCities.length > 0 ? topCities.map((city, index) => (
            <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/60 hover:shadow-lg hover:border-blue-300/50 hover:from-blue-50/60 hover:to-indigo-50/40 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">
                    {city.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Building2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="font-medium">{city.properties}</span>
                    <span className="text-gray-500">authorities</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-base font-medium mb-2 text-gray-700">No Cities Found</p>
              <p className="text-sm text-gray-500">No PHA offices found in {stateName}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
