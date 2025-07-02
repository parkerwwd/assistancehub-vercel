
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import OfficeDetailsPanel from "./OfficeDetailsPanel";
import TokenInput from "./TokenInput";
import MapFilters from "./MapFilters";
import MapContainer from "./MapContainer";
import { useMapLogic } from "@/hooks/useMapLogic";

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
                <OfficeDetailsPanel selectedOffice={selectedOffice} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default MapView;
