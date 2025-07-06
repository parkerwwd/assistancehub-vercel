
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, Building, MapPin, Users } from 'lucide-react';
import StateHeroSection from '@/components/state/StateHeroSection';
import StateAboutSection from '@/components/state/StateAboutSection';
import StateSearchGuide from '@/components/state/StateSearchGuide';
import StateCitiesSidebar from '@/components/state/StateCitiesSidebar';
import StateContactHelp from '@/components/state/StateContactHelp';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';
  
  // Fake static data
  const stateData = {
    totalUnits: '1,250',
    properties: '8',
    cities: '6',
    agencies: '8',
    averageWaitTime: '12-24 months',
    lastUpdated: 'December 2024',
    occupancyRate: '94%',
    quickStats: [
      { label: 'Available Units', value: '1,250', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Housing Authorities', value: '8', icon: Building, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Cities Served', value: '6', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Active Programs', value: '3', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ]
  };

  // Fake cities data
  const topCities = [
    {
      name: 'Anchorage',
      units: '450',
      properties: '3',
      population: '291,538',
      waitTime: '18-30 months'
    },
    {
      name: 'Fairbanks',
      units: '280',
      properties: '2',
      population: '31,635',
      waitTime: '12-24 months'
    },
    {
      name: 'Juneau',
      units: '220',
      properties: '1',
      population: '32,255',
      waitTime: '15-28 months'
    },
    {
      name: 'Wasilla',
      units: '150',
      properties: '1',
      population: '9,054',
      waitTime: '10-20 months'
    },
    {
      name: 'Sitka',
      units: '100',
      properties: '1',
      population: '8,458',
      waitTime: '8-18 months'
    },
    {
      name: 'Ketchikan',
      units: '50',
      properties: '1',
      population: '8,192',
      waitTime: '6-15 months'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      <StateHeroSection stateName={stateName} stateData={stateData} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <StateAboutSection stateName={stateName} stateData={stateData} />
              <StateSearchGuide stateName={stateName} />
            </div>

            <div className="space-y-6">
              <StateCitiesSidebar topCities={topCities} stateName={stateName} />
              <StateContactHelp />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default State;
