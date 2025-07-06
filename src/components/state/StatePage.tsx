
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StateHeroSection from '@/components/state/StateHeroSection';
import StateAboutSection from '@/components/state/StateAboutSection';
import StateSearchGuide from '@/components/state/StateSearchGuide';
import StateCitiesSidebar from '@/components/state/StateCitiesSidebar';
import StateContactHelp from '@/components/state/StateContactHelp';
import StatePHASection from '@/components/state/StatePHASection';
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <StateAboutSection stateName={stateName} stateData={stateData} />
              <StateSearchGuide stateName={stateName} />
              <StatePHASection 
                stateName={stateName}
                phaAgencies={phaAgencies}
                loading={phaLoading}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
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
