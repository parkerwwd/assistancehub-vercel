
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import OfficeDetailsPanel from "./OfficeDetailsPanel";
import PHADetailView from "./PHADetailView";
import HousingListings from "./HousingListings";
import TokenInput from "./TokenInput";
import MapFilters from "./MapFilters";
import MapContainer from "./MapContainer";
import { useMapLogic } from "@/hooks/useMapLogic";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

interface MapViewProps {
  hideSearch?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ hideSearch = false }) => {
  const {
    mapboxToken,
    selectedOffice,
    tokenError,
    showFilters,
    mapRef,
    phaAgencies,
    loading,
    currentPage,
    totalPages,
    totalCount,
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handlePageChange
  } = useMapLogic();

  const [viewState, setViewState] = useState<ViewState>('overview');
  const [detailOffice, setDetailOffice] = useState<PHAAgency | null>(null);

  const handleOfficeClick = (office: PHAAgency) => {
    console.log('🎯 Office clicked from panel:', office.name);
    // First select the office on the map (this will fly to it)
    setSelectedOffice(office);
    // Then show detail view
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
    <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      {/* Search bar above the map - only show if not hidden */}
      {!hideSearch && (
        <div className="p-4 border-b bg-white">
          <MapFilters
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onCitySelect={handleCitySelect}
          />
        </div>
      )}
      
      {/* Map and details panel */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Map Panel */}
          <ResizablePanel defaultSize={50} minSize={35}>
            <div className="relative h-full bg-gray-100">
              <MapContainer
                ref={mapRef}
                mapboxToken={mapboxToken}
                phaAgencies={phaAgencies}
                onOfficeSelect={setSelectedOffice}
                onTokenError={setTokenError}
              />
            </div>
          </ResizablePanel>
          
          {/* Resize Handle */}
          <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors w-1" />
          
          {/* Details Panel */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={65}>
            <div className="bg-white h-full overflow-y-auto border-l">
              {renderRightPanel()}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default MapView;
