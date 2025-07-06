
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Building2, Users, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StateContactHelp: React.FC = () => {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const stateName = state ? decodeURIComponent(state) : '';

  const handleWaitlistClick = () => {
    navigate(`/state/${encodeURIComponent(stateName)}/waitlists`);
  };

  const housingTypes = [
    { label: 'Section 8 Housing', icon: Home, highlight: false, clickable: false },
    { label: 'Income Restricted Apartments', icon: Building2, highlight: false, clickable: false },
    { label: 'Townhomes', icon: Home, highlight: false, clickable: false },
    { label: 'Open Section 8 Waiting Lists', icon: FileText, highlight: true, clickable: true, onClick: handleWaitlistClick },
    { label: 'Low Income Rentals', icon: MapPin, highlight: false, clickable: false },
    { label: 'Public Housing', icon: Building2, highlight: false, clickable: false },
    { label: 'Public Housing Agencies (PHA)', icon: Users, highlight: false, clickable: false }
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
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                type.highlight 
                  ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100 animate-pulse' 
                  : 'bg-white/70 hover:bg-white'
              } ${
                type.clickable 
                  ? 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95 transform' 
                  : ''
              }`}
              onClick={type.onClick}
              style={{
                animationDuration: type.highlight ? '2s' : undefined,
                animationIterationCount: type.highlight ? 'infinite' : undefined
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                type.highlight 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-green-500 text-white'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className={`font-medium transition-colors duration-300 ${
                  type.highlight ? 'text-blue-700 animate-pulse' : 'text-green-700'
                } ${
                  type.clickable ? 'hover:text-blue-800' : ''
                }`}
                style={{
                  animationDuration: type.highlight ? '2.5s' : undefined,
                  animationIterationCount: type.highlight ? 'infinite' : undefined
                }}>
                  {type.label}
                </span>
              </div>
              <type.icon className={`w-4 h-4 transition-all duration-300 ${
                type.highlight ? 'text-blue-500' : 'text-green-500'
              } ${
                type.clickable ? 'hover:text-blue-600 hover:translate-x-2' : ''
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
