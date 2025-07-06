
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StateHeroSection from '@/components/state/StateHeroSection';
import StateAboutSection from '@/components/state/StateAboutSection';
import StateSearchGuide from '@/components/state/StateSearchGuide';
import StateCitiesSidebar from '@/components/state/StateCitiesSidebar';
import StateContactHelp from '@/components/state/StateContactHelp';
import { StateDataType, CityType } from './StateData';

interface StatePageProps {
  stateName: string;
  stateData: StateDataType;
  topCities: CityType[];
}

const StatePage: React.FC<StatePageProps> = ({ stateName, stateData, topCities }) => {
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

export default StatePage;
