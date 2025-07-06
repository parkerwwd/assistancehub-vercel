import React from 'react';
import { Calendar, TrendingUp, Clock, Home, Building, MapPin, Users } from 'lucide-react';
import { GoogleMapsService } from '@/services/googleMapsService';

interface StateData {
  totalUnits: string;
  properties: string;
  cities: string;
  agencies: string;
  averageWaitTime: string;
  lastUpdated: string;
  occupancyRate: string;
  quickStats: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }>;
}

interface StateHeroSectionProps {
  stateName: string;
  stateData: StateData;
}

const StateHeroSection: React.FC<StateHeroSectionProps> = ({ stateName, stateData }) => {
  // Get Google Maps static image for the state
  const stateMapImage = GoogleMapsService.getStaticMapImage(`${stateName}, USA`, '800x600');

  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/6fec7525-51b9-405f-a872-6143d0c0924a.png')`
        }}
      ></div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Section 8 Housing
            <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-300 bg-clip-text text-transparent">
              in {stateName}
            </span>
          </h1>

          {/* Enhanced Stats Card with More Blur Effect */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {stateData.quickStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${stat.bgColor} flex items-center justify-center backdrop-blur-xl`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span>Last Updated: {stateData.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span>Occupancy Rate: {stateData.occupancyRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-300" />
                <span>Avg. Wait: {stateData.averageWaitTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateHeroSection;
