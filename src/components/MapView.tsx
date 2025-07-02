
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
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch
  } = useMapLogic();

  return (
    <div className="h-full flex flex-col">
      {/* Mapbox Token Input */}
      <TokenInput 
        mapboxToken={mapboxToken}
        tokenError={tokenError}
        onTokenChange={handleTokenChange}
      />

      {/* Search and Filters */}
      {mapboxToken && (
        <MapFilters
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onCitySelect={handleCitySelect}
          onSearch={handleSearch}
        />
      )}

      {/* Main Content - Resizable Side-by-Side Layout */}
      {mapboxToken && (
        <div className="flex-1">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Map Panel */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full">
                <MapContainer
                  mapboxToken={mapboxToken}
                  onOfficeSelect={setSelectedOffice}
                  onTokenError={setTokenError}
                />
              </div>
            </ResizablePanel>
            
            {/* Resize Handle */}
            <ResizableHandle withHandle />
            
            {/* Details Panel */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full pl-4">
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
