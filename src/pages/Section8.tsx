
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import PHADetailView from "@/components/PHADetailView";
import HousingListings from "@/components/HousingListings";
import MapContainer from "@/components/MapContainer";
import { useMapLogic } from "@/hooks/useMapLogic";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

const Section8 = () => {
  console.log('Section8 component rendering...');
  
  const {
    mapboxToken,
    selectedOffice,
    tokenError,
    mapRef,
    phaAgencies,
    loading,
    currentPage,
    totalPages,
    totalCount,
    setSelectedOffice,
    setTokenError,
    handleTokenChange,
    handlePageChange,
  } = useMapLogic();

  const [viewState, setViewState] = React.useState<ViewState>('overview');
  const [detailOffice, setDetailOffice] = React.useState<PHAAgency | null>(null);

  const handleOfficeClick = (office: PHAAgency) => {
    console.log('🎯 Office clicked from panel:', office.name);
    setSelectedOffice(office);
    setDetailOffice(office);
    setViewState('pha-detail');
  };

  const handleViewHousing = (office: PHAAgency) => {
    setDetailOffice(office);
    setViewState('housing-listings');
  };

  const handleBackToOverview = () => {
    setViewState('overview');
    setDetailOffice(null);
    setSelectedOffice(null);
  };

  const handleBackToPHADetail = () => {
    setViewState('pha-detail');
  };

  const renderLeftPanel = () => {
    switch (viewState) {
      case 'pha-detail':
        return detailOffice ? (
          <PHADetailView 
            office={detailOffice}
            onViewHousing={handleViewHousing}
            onBack={handleBackToOverview}
          />
        ) : null;
      
      case 'housing-listings':
        return detailOffice ? (
          <HousingListings 
            office={detailOffice}
            onBack={handleBackToPHADetail}
          />
        ) : null;
      
      default:
        return (
          <OfficeDetailsPanel 
            selectedOffice={selectedOffice}
            onOfficeClick={handleOfficeClick}
            phaAgencies={phaAgencies}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        );
    }
  };

  if (!mapboxToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Mapbox Token Required</h2>
          <p className="text-gray-600">Please configure your Mapbox token to view the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - PHA List */}
        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <div className="h-full overflow-y-auto border-r bg-white">
            {renderLeftPanel()}
          </div>
        </ResizablePanel>
        
        {/* Resize Handle */}
        <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors w-1" />
        
        {/* Right Panel - Map */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full bg-gray-100">
            <MapContainer
              ref={mapRef}
              mapboxToken={mapboxToken}
              phaAgencies={phaAgencies}
              onOfficeSelect={setSelectedOffice}
              onTokenError={setTokenError}
              selectedOffice={selectedOffice}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Section8;
