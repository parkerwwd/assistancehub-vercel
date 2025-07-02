
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import OfficeDetailsPanel from "./OfficeDetailsPanel";
import PHADetailView from "./PHADetailView";
import HousingListings from "./HousingListings";
import TokenInput from "./TokenInput";
import MapFilters from "./MapFilters";
import MapContainer from "./MapContainer";
import { useMapLogic } from "@/hooks/useMapLogic";
import { PHAOffice } from "@/types/phaOffice";

type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

const MapView = () => {
  const {
    mapboxToken,
    selectedOffice,
    tokenError,
    showFilters,
    mapRef,
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch
  } = useMapLogic();

  const [viewState, setViewState] = useState<ViewState>('overview');
  const [detailOffice, setDetailOffice] = useState<PHAOffice | null>(null);

  const handleOfficeClick = (office: PHAOffice) => {
    setDetailOffice(office);
    setViewState('pha-detail');
  };

  const handleViewHousing = (office: PHAOffice) => {
    setDetailOffice(office);
    setViewState('housing-listings');
  };

  const handleBackToOverview = () => {
    setViewState('overview');
    setDetailOffice(null);
  };

  const handleBackToPHADetail = () => {
    setViewState('pha-detail');
  };

  const renderRightPanel = () => {
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
        return <OfficeDetailsPanel selectedOffice={selectedOffice} onOfficeClick={handleOfficeClick} />;
    }
  };

  if (!mapboxToken) {
    return (
      <div className="h-full bg-white rounded-lg shadow-sm border">
        <TokenInput 
          mapboxToken={mapboxToken}
          tokenError={tokenError}
          onTokenChange={handleTokenChange}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Map Panel with integrated search */}
        <ResizablePanel defaultSize={65} minSize={50}>
          <div className="relative h-full bg-gray-100">
            {/* Search overlay */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <MapFilters
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onCitySelect={handleCitySelect}
                onSearch={handleSearch}
              />
            </div>
            
            {/* Map */}
            <MapContainer
              ref={mapRef}
              mapboxToken={mapboxToken}
              onOfficeSelect={setSelectedOffice}
              onTokenError={setTokenError}
            />
          </div>
        </ResizablePanel>
        
        {/* Resize Handle */}
        <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors w-1" />
        
        {/* Details Panel */}
        <ResizablePanel defaultSize={35} minSize={30} maxSize={50}>
          <div className="bg-white h-full overflow-y-auto border-l">
            {renderRightPanel()}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MapView;
