
import React from 'react';
import { Home } from 'lucide-react';
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
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl md:text-3xl text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="leading-tight">Housing Assistance in {stateName}</span>
        </CardTitle>
        <CardDescription className="text-base md:text-lg text-gray-600">
          Comprehensive guide to affordable housing programs and opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mobile: Single column, Desktop: Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-center py-2">
            <div className="text-2xl md:text-2xl font-bold text-blue-600">{stateData.totalUnits}</div>
            <div className="text-sm text-gray-600">PHA Offices Found</div>
          </div>
          <div className="text-center py-2">
            <div className="text-2xl md:text-2xl font-bold text-green-600">{stateData.agencies}</div>
            <div className="text-sm text-gray-600">Housing Authorities</div>
          </div>
          <div className="text-center py-2">
            <div className="text-2xl md:text-2xl font-bold text-purple-600">{stateData.cities}</div>
            <div className="text-sm text-gray-600">Estimated Cities</div>
          </div>
        </div>
        
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          {stateName} has {stateData.totalUnits} Public Housing Agencies in our database. 
          Our comprehensive search covers {stateData.cities} estimated cities across the state, 
          with {stateData.agencies} certified Public Housing Authorities providing Section 8 and other affordable housing programs.
        </p>
      </CardContent>
    </Card>
  );
};

export default StateAboutSection;
