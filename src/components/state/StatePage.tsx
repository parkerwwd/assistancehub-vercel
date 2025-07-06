
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StateHeroSection from '@/components/state/StateHeroSection';
import StateAboutSection from '@/components/state/StateAboutSection';
import StateSearchGuide from '@/components/state/StateSearchGuide';
import StateCitiesSidebar from '@/components/state/StateCitiesSidebar';
import StateContactHelp from '@/components/state/StateContactHelp';
import { StateDataType, CityType } from './StateData';
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface StatePageProps {
  stateName: string;
  stateData: StateDataType;
  topCities: CityType[];
  phaAgencies?: PHAAgency[];
  phaLoading?: boolean;
}

const StatePage: React.FC<StatePageProps> = ({ 
  stateName, 
  stateData, 
  topCities, 
  phaAgencies = [],
  phaLoading = false 
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stateName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      <StateHeroSection stateName={stateName} stateData={stateData} />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Main content - Full width on mobile */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <StateAboutSection stateName={stateName} stateData={stateData} />
              <StateSearchGuide stateName={stateName} />
            </div>

            {/* Sidebar - Full width on mobile, stacked after main content */}
            <div className="space-y-6 order-first lg:order-last">
              <StateCitiesSidebar 
                topCities={topCities} 
                stateName={stateName} 
                loading={phaLoading}
              />
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
