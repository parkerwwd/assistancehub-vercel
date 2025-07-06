
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
  const [visibleCities, setVisibleCities] = useState(4);
  const navigate = useNavigate();
  
  const handleShowMore = () => {
    setVisibleCities(prev => Math.min(prev + 2, topCities.length));
  };

  const handleShowAllOffices = () => {
    navigate(`/state/${encodeURIComponent(stateName)}/offices`);
  };

  const handleCityClick = (cityName: string) => {
    // Navigate to offices page with city filter
    navigate(`/state/${encodeURIComponent(stateName)}/offices?city=${encodeURIComponent(cityName)}`);
  };
  
  const citiesToShow = topCities.slice(0, visibleCities);
  const hasMoreCities = visibleCities < topCities.length;

  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-base font-bold">Cities in {stateName}</div>
              <CardDescription className="text-xs text-gray-600 mt-0.5">Housing authorities by location</CardDescription>
            </div>
          </CardTitle>
          
          <Button
            onClick={handleShowAllOffices}
            size="sm"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium shadow-sm"
          >
            Show All Offices
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {citiesToShow.length > 0 ? (
              <>
                {citiesToShow.map((city, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleCityClick(city.name)}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/30 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer hover:border-blue-200/60"
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    
                    <div className="relative p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Modern icon container */}
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 shadow-sm">
                            <Building2 className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                          </div>
                          
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors duration-300">
                              {city.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                {city.properties} {parseInt(city.properties) === 1 ? 'office' : 'offices'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-all duration-300 group-hover:shadow-sm">
                          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show More Button */}
                {hasMoreCities && (
                  <div className="pt-2">
                    <Button
                      onClick={handleShowMore}
                      variant="outline"
                      size="sm"
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More Cities ({topCities.length - visibleCities} remaining)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-gray-600">No Cities Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
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
