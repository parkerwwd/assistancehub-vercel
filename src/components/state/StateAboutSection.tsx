
import React from 'react';
import { Home, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StateAboutSectionProps {
  stateName: string;
  stateData: {
    totalUnits: string;
    agencies: string;
    cities: string;
  };
}

const StateAboutSection: React.FC<StateAboutSectionProps> = ({ stateName, stateData }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          Housing Assistance in {stateName}
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Comprehensive guide to affordable housing programs and opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{stateData.totalUnits}</div>
            <div className="text-sm text-gray-600 font-medium">PHA Offices</div>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{stateData.agencies}</div>
            <div className="text-sm text-gray-600 font-medium">Housing Authorities</div>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{stateData.cities}</div>
            <div className="text-sm text-gray-600 font-medium">Estimated Cities</div>
          </div>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed text-base">
            {stateName} has <span className="font-semibold text-blue-600">{stateData.totalUnits} Public Housing Agencies</span> in our database. 
            Our comprehensive search covers <span className="font-semibold text-purple-600">{stateData.cities} estimated cities</span> across the state, 
            with <span className="font-semibold text-green-600">{stateData.agencies} certified Public Housing Authorities</span> providing Section 8 and other affordable housing programs.
          </p>
          <p className="text-gray-600 text-sm mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <strong>Need help finding housing?</strong> Use our search tools to locate available programs, check waiting list status, and connect with local housing authorities in your area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateAboutSection;
