
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Mapbox Token Input */}
      <TokenInput 
        mapboxToken={mapboxToken}
        tokenError={tokenError}
        onTokenChange={handleTokenChange}
      />

      {/* Search and Filters */}
      {mapboxToken && (
        <div className="px-4 pb-4">
          <MapFilters
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onCitySelect={handleCitySelect}
            onSearch={handleSearch}
          />
        </div>
      )}

      {/* Main Content - Resizable Side-by-Side Layout */}
      {mapboxToken && (
        <div className="flex-1 px-4 pb-4">
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg overflow-hidden shadow-sm">
            {/* Map Panel */}
            <ResizablePanel defaultSize={75} minSize={60}>
              <div className="bg-white h-full relative">
                <MapContainer
                  ref={mapRef}
                  mapboxToken={mapboxToken}
                  onOfficeSelect={setSelectedOffice}
                  onTokenError={setTokenError}
                />
              </div>
            </ResizablePanel>
            
            {/* Resize Handle */}
            <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors" />
            
            {/* Details Panel */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="bg-white h-full">
                {renderRightPanel()}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default MapView;
