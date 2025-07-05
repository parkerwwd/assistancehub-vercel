
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface City {
  name: string | null;
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
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Cities in {stateName}
        </CardTitle>
        <CardDescription>Cities with housing authorities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCities.length > 0 ? topCities.map((city, index) => (
            <div key={index} className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{city.name}</div>
                  <div className="text-sm text-gray-600">{city.properties} authorities</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{city.units}</div>
                  <div className="text-xs text-gray-500">est. units</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{city.properties} properties</span>
                <span className="text-orange-600 font-medium">~{city.waitTime}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No cities found for {stateName}</p>
            </div>
          )}
        </div>
        <Link to="/section8">
          <Button variant="outline" className="w-full mt-4 hover:bg-blue-50">
            View All Housing Options <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default StateCitiesSidebar;
