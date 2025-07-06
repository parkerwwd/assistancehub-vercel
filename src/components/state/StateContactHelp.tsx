
import React from 'react';
import { CheckCircle, Home, Building2, Users, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StateContactHelp: React.FC = () => {
  const housingTypes = [
    { label: 'Section 8 Housing', icon: Home, highlight: false },
    { label: 'Income Restricted Apartments', icon: Building2, highlight: false },
    { label: 'Townhomes', icon: Home, highlight: false },
    { label: 'Open Section 8 Waiting Lists', icon: FileText, highlight: false },
    { label: 'Low Income Rentals', icon: MapPin, highlight: false },
    { label: 'Public Housing', icon: Building2, highlight: false },
    { label: 'Public Housing Agencies (PHA)', icon: Users, highlight: false }
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl border-green-200">
      <CardHeader>
        <CardTitle className="text-xl text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          What You'll Find
        </CardTitle>
        <CardDescription className="text-green-600">
          Comprehensive housing resources available in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {housingTypes.map((type, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                type.highlight 
                  ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                  : 'bg-white/70 hover:bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                type.highlight 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className={`font-medium ${
                  type.highlight ? 'text-green-700' : 'text-green-700'
                }`}>
                  {type.label}
                </span>
              </div>
              <type.icon className={`w-4 h-4 ${
                type.highlight ? 'text-green-500' : 'text-green-500'
              }`} />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Your Housing Journey</h4>
              <p className="text-green-700 text-sm leading-relaxed">
                We understand that searching for affordable housing can be a journey. Your specific search will be unique to your needs. 
                Easily search low-income housing by city using the resources below. We support your journey by providing comprehensive 
                tools to assist you in your search.
              </p>
              <p className="text-green-600 text-xs mt-2 font-medium">
                Take your time, gather the necessary information, and know that you're not alone.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StateContactHelp;
