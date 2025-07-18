
import React, { useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import MapContainer from "@/components/MapContainer";
import Header from "@/components/Header";
import MobileSection8Layout from "@/components/MobileSection8Layout";
import { useSearchMap } from "@/contexts/SearchMapContext";
import { useMap } from "@/hooks/useMap";
import { useIsMobile } from "@/hooks/use-mobile";
import { Database } from "@/integrations/supabase/types";
import { Property } from "@/types/property";
import { toast } from "@/components/ui/use-toast";
import { USLocation, allUSLocations } from "@/data/usLocations";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const Section8 = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchLocation = location.state?.searchLocation;
  const { state, actions } = useSearchMap();
  const { mapRef, handleLocationSearch, handleOfficeSelection, resetToUSView } = useMap();
  const isMobile = useIsMobile();
  
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
  
  // Create stable callback for token errors
  const handleTokenError = useCallback((error: string) => {
    // Just log to console, don't show toast
    console.error('❌ Mapbox token error:', error);
  }, []);
  
  // Handle navigation from home page search or URL params (only runs once when location changes)
  useEffect(() => {
    if (searchLocation) {
      // Priority 1: Direct navigation from home page
      handleLocationSearch(searchLocation);
    } else if (searchParams.get('search')) {
      // Priority 2: Restore from URL params (browser back button)
      const searchName = searchParams.get('search');
      const searchType = searchParams.get('type') as 'city' | 'county' | 'state';
      const stateCode = searchParams.get('state');
      
      if (searchName && searchType) {
        // Find the actual location data with coordinates
        const foundLocation = allUSLocations.find(loc => 
          loc.name === searchName && 
          loc.type === searchType &&
          (!stateCode || loc.stateCode === stateCode)
        );
        
        if (foundLocation) {
          console.log('🔄 Restoring search from URL params with full location data:', foundLocation);
          handleLocationSearch(foundLocation);
        } else {
          // Fallback: create location without coordinates (will trigger geocoding)
          const restoredLocation: USLocation = {
            name: searchName,
            type: searchType,
            stateCode: stateCode || '',
            latitude: 0,
            longitude: 0
          };
          console.log('🔄 Restoring search from URL params (without coordinates):', restoredLocation);
          handleLocationSearch(restoredLocation);
        }
      }
    } else {
      // If no search location, reset to US view after a delay
      // COMMENTED OUT: This might interfere with header searches
      // const timer = setTimeout(() => {
      //   resetToUSView();
      // }, 1000);
      // return () => clearTimeout(timer);
    }
  }, [searchLocation, searchParams, handleLocationSearch, resetToUSView]);
  
  // Update URL when search location changes
  useEffect(() => {
    if (state.searchLocation) {
      const params = new URLSearchParams();
      params.set('search', state.searchLocation.name);
      params.set('type', state.searchLocation.type);
      if (state.searchLocation.stateCode) {
        params.set('state', state.searchLocation.stateCode);
      }
      
      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
      console.log('📝 Updated URL with search params:', newUrl);
    }
  }, [state.searchLocation]);
  
  // Handle office clicks from map pins (no flyTo to prevent bouncing)
  const handleOfficeClick = useCallback((office: PHAAgency | Property | null) => {
    console.log('🎯 Map pin clicked:', office?.name, 'ID:', office?.id);
    console.log('🔍 Is property?', office && !('supports_hcv' in office));
    // Set the selected office in context (works for both PHAs and properties)
    actions.setSelectedOffice(office);
  }, [actions]);
  
  // Handle office clicks from list (with flyTo to show on map)
  const handleOfficeListClick = useCallback((office: PHAAgency | Property) => {
    console.log('📋 List item clicked:', office.name);
    // Set the selected office in context
    actions.setSelectedOffice(office);
    
    // If it's a PHA and we want to fly to it on the map
    if ('supports_hcv' in office) {
      handleOfficeSelection(office as PHAAgency, true);
    }
  }, [actions, handleOfficeSelection]);
  
  // Handle city selection from header search
  const handleHeaderCitySelect = useCallback((location: any) => {
    console.log('🌟 Section8.handleHeaderCitySelect called with:', location);
    handleLocationSearch(location);
  }, [handleLocationSearch]);
  
  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    actions.setCurrentPage(page);
  }, [actions]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    actions.clearSearch();
    resetToUSView();
  }, [actions, resetToUSView]);
  
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
            selectedOffice={state.selectedOffice && 'supports_hcv' in state.selectedOffice ? state.selectedOffice as PHAAgency : null}
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
            setSelectedOffice={(office) => actions.setSelectedOffice(office)}
            handleOfficeClick={handleOfficeListClick as any}
            handleViewHousing={() => {}}
            handleBackToOverview={() => {}}
            handleBackToPHADetail={() => {}}
            handlePageChange={handlePageChange}
            clearLocationFilter={handleClearSearch}
            setTokenError={handleTokenError}
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
              <div className="relative h-full">
                <MapContainer
                  ref={mapRef}
                  mapboxToken={mapboxToken}
                  phaAgencies={state.filteredAgencies}
                  onOfficeSelect={handleOfficeClick}
                  onTokenError={handleTokenError}
                  selectedOffice={state.selectedOffice}
                  selectedLocation={state.selectedLocation}
                />
              </div>
            </div>
            
            {/* Fixed Divider Line */}
            <div className="w-px bg-gray-300 flex-shrink-0"></div>
            
            {/* Right Panel - PHA List (Fixed 40% width) */}
            <div className="w-2/5 h-full overflow-y-auto bg-white">
              {(() => {
                console.log('🔍 OfficeDetailsPanel data:', {
                  selectedOfficeId: state.selectedOffice?.id,
                  selectedOfficeName: state.selectedOffice?.name,
                  isPHA: state.selectedOffice && 'supports_hcv' in state.selectedOffice,
                  paginatedAgenciesCount: state.paginatedAgencies.length,
                  filteredAgenciesCount: state.filteredAgencies.length,
                  currentPage: state.currentPage,
                  isSelectedInCurrentPage: state.paginatedAgencies.some(a => a.id === state.selectedOffice?.id)
                });
                return null;
              })()}
              <OfficeDetailsPanel
                selectedOffice={state.selectedOffice}
                onOfficeClick={handleOfficeListClick}
                phaAgencies={state.filteredAgencies}
                loading={state.loading}
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                totalCount={state.totalCount}
                onPageChange={handlePageChange}
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
