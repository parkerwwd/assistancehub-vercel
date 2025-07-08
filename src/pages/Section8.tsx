
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import MapContainer from "@/components/MapContainer";
import Header from "@/components/Header";
import MobileSection8Layout from "@/components/MobileSection8Layout";
import { useSearchMap } from "@/contexts/SearchMapContext";
import { useMap } from "@/hooks/useMap";
import { useIsMobile } from "@/hooks/use-mobile";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const Section8 = () => {
  const location = useLocation();
  const searchLocation = location.state?.searchLocation;
  const { state, actions } = useSearchMap();
  const { mapRef, handleLocationSearch, handleOfficeSelection, resetToUSView } = useMap();
  const isMobile = useIsMobile();
  
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
  
  // Handle navigation from home page search (only runs once when location changes)
  useEffect(() => {
    if (searchLocation) {
      handleLocationSearch(searchLocation);
    } else {
      // If no search location, reset to US view after a delay
      const timer = setTimeout(() => {
        resetToUSView();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchLocation, handleLocationSearch, resetToUSView]);
  
  // Handle office clicks from map pins (no flyTo to prevent bouncing)
  const handleOfficeClick = (office: PHAAgency | null) => {
    handleOfficeSelection(office, false);
  };
  
  // Handle office clicks from list (with flyTo to show on map)
  const handleOfficeListClick = (office: PHAAgency) => {
    handleOfficeSelection(office, true);
  };
  
  // Handle city selection from header search
  const handleHeaderCitySelect = (location: any) => {
    console.log('🌟 Section8.handleHeaderCitySelect called with:', location);
    handleLocationSearch(location);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    actions.setCurrentPage(page);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    actions.clearSearch();
    resetToUSView();
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
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <Header 
        showSearch={true}
        onCitySelect={handleHeaderCitySelect}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <MobileSection8Layout
            mapboxToken={mapboxToken}
            selectedOffice={state.selectedOffice}
            filteredLocation={state.searchLocation}
            mapRef={mapRef}
            phaAgencies={state.paginatedAgencies}
            filteredAgencies={state.filteredAgencies}
            allPHAAgencies={state.allPHAAgencies}
            loading={state.loading}
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            totalCount={state.totalCount}
            viewState="overview"
            detailOffice={null}
            setSelectedOffice={actions.setSelectedOffice}
            handleOfficeClick={handleOfficeListClick}
            handleViewHousing={() => {}}
            handleBackToOverview={() => {}}
            handleBackToPHADetail={() => {}}
            handlePageChange={handlePageChange}
            clearLocationFilter={handleClearSearch}
            setTokenError={() => {}}
            selectedLocation={state.selectedLocation}
          />
        ) : (
          <div className="flex h-full">
            {/* Left Panel - Map (Fixed 60% width) */}
            <div className="w-3/5 h-full bg-gray-100">
              {(() => {
                console.log('🗺️ MapContainer props:', {
                  hasSearchLocation: !!state.searchLocation,
                  searchLocationName: state.searchLocation?.name,
                  filteredAgenciesCount: state.filteredAgencies.length,
                  allPHAAgenciesCount: state.allPHAAgencies.length,
                  selectedLocation: state.selectedLocation,
                  selectedOffice: state.selectedOffice?.name
                });
                return null;
              })()}
              <MapContainer
                ref={mapRef}
                mapboxToken={mapboxToken}
                phaAgencies={state.searchLocation ? state.filteredAgencies : state.allPHAAgencies}
                onOfficeSelect={handleOfficeClick}
                onTokenError={() => {}}
                selectedOffice={state.selectedOffice}
                selectedLocation={state.selectedLocation}
              />
            </div>
            
            {/* Fixed Divider Line */}
            <div className="w-px bg-gray-300 flex-shrink-0"></div>
            
            {/* Right Panel - PHA List (Fixed 40% width) */}
            <div className="w-2/5 h-full overflow-y-auto bg-white">
              <OfficeDetailsPanel
                selectedOffice={state.selectedOffice}
                onOfficeClick={handleOfficeListClick}
                phaAgencies={state.paginatedAgencies}
                loading={state.loading}
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                totalCount={state.totalCount}
                onPageChange={handlePageChange}
                onShowAll={handleClearSearch}
                hasFilter={!!state.searchLocation}
                filteredLocation={state.searchLocation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section8;
