
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
      {/* Main Background Image - Clearer and Darker */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/a6f307a6-bd25-47c7-9da5-c7df148d00d2.png')`
        }}
      ></div>
      
      {/* Dark Overlay for Better Text Visibility */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Background Pattern and Map Image */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Google Maps Image Overlay */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-96 h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <img 
            src={stateMapImage}
            alt={`Map of ${stateName}`}
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              // Hide the map overlay if it fails to load
              e.currentTarget.parentElement!.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 "></div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* State Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-4 rounded-full mb-8 shadow-2xl">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-lg">Live Housing Data for {stateName}</span>
          </div>

          {/* Main Title - Combined into one line */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Section 8 Housing in {stateName}
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
