
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
  loading?: boolean;
}

const StateCitiesSidebar: React.FC<StateCitiesSidebarProps> = ({ 
  topCities, 
  stateName, 
  loading = false 
}) => {
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
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topCities.length > 0 ? topCities.map((city, index) => (
              <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100/50 hover:border-blue-200/50">
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <div className="font-semibold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                      {city.name}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {city.properties} authorities
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-10 h-10 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium mb-2">No Cities Found</p>
                <p className="text-sm text-gray-400">No PHA offices found in {stateName}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
