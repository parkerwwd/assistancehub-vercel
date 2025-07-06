
import React from 'react';
import { MapPin, Building2, ChevronRight, Users, Clock } from 'lucide-react';
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
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100/50">
        <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">Top Cities in {stateName}</div>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Cities with the most PHA offices
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topCities.length > 0 ? topCities.map((city, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/30 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 cursor-pointer hover:border-blue-200/60"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* City icon container */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 shadow-sm flex-shrink-0">
                        <Building2 className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                      </div>
                      
                      <div className="space-y-3 flex-1 min-w-0">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors duration-300 truncate">
                            {city.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                              {city.properties} offices
                            </span>
                          </div>
                        </div>
                        
                        {/* Statistics grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="text-gray-500 text-xs font-medium flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              Est. Units
                            </div>
                            <div className="font-semibold text-gray-900">{city.units}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-gray-500 text-xs font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Population
                            </div>
                            <div className="font-semibold text-gray-900">{city.population}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-gray-500 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Wait Time
                          </div>
                          <div className="font-semibold text-orange-600">{city.waitTime}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-all duration-300 group-hover:shadow-md flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-600">No Cities Found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    No PHA offices found in {stateName}. Check back later for updates.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
