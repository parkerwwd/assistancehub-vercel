
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import MapContainer from "@/components/MapContainer";
import Header from "@/components/Header";
import MobileSection8Layout from "@/components/MobileSection8Layout";
import { useMapLogic } from "@/hooks/useMapLogic";
import { useIsMobile } from "@/hooks/use-mobile";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const Section8 = () => {
  console.log('Section8 component rendering...');
  
  const location = useLocation();
  const searchLocation = location.state?.searchLocation;
  
  const {
    mapboxToken,
    selectedOffice,
    selectedLocation,
    filteredLocation,
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
    handleCitySelect,
    setSelectedLocation,
    clearLocationFilter,
    resetToUSView,
  } = useMapLogic();

  const isMobile = useIsMobile();

  // Handle navigation from state page
  useEffect(() => {
    if (searchLocation && mapRef.current) {
      console.log('🏛️ Received search location from state page:', searchLocation);
      handleCitySelect(searchLocation);
    }
  }, [searchLocation, handleCitySelect]);

  // Reset to US view when component mounts (only if no search location)
  useEffect(() => {
    if (!searchLocation) {
      const timer = setTimeout(() => {
        if (mapRef.current) {
          console.log('🇺🇸 Initial page load - showing US map');
          resetToUSView();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchLocation]);

  const handleOfficeClick = (office: PHAAgency) => {
    console.log('🎯 Office clicked from panel:', office.name);
    
    // First select the office on the map (this will fly to it and show marker)
    setSelectedOffice(office);
  };

  const handleHeaderCitySelect = (location: any) => {
    console.log('🏙️ Section8 received location selection:', location);
    handleCitySelect(location);
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
            selectedOffice={selectedOffice}
            filteredLocation={filteredLocation}
            mapRef={mapRef}
            phaAgencies={phaAgencies}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            viewState="overview"
            detailOffice={null}
            setSelectedOffice={setSelectedOffice}
            handleOfficeClick={handleOfficeClick}
            handleViewHousing={() => {}}
            handleBackToOverview={() => {}}
            handleBackToPHADetail={() => {}}
            handlePageChange={handlePageChange}
            clearLocationFilter={clearLocationFilter}
            setTokenError={setTokenError}
            selectedLocation={selectedLocation}
          />
        ) : (
          <div className="flex h-full">
            {/* Left Panel - Map (Fixed 60% width) */}
            <div className="w-3/5 h-full bg-gray-100">
              <MapContainer
                ref={mapRef}
                mapboxToken={mapboxToken}
                phaAgencies={phaAgencies}
                onOfficeSelect={handleOfficeClick}
                onTokenError={setTokenError}
                selectedOffice={selectedOffice}
                selectedLocation={selectedLocation}
              />
            </div>
            
            {/* Fixed Divider Line */}
            <div className="w-px bg-gray-300 flex-shrink-0"></div>
            
            {/* Right Panel - PHA List (Fixed 40% width) */}
            <div className="w-2/5 h-full overflow-y-auto bg-white">
              <OfficeDetailsPanel
                selectedOffice={selectedOffice}
                onOfficeClick={handleOfficeClick}
                phaAgencies={phaAgencies}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                onShowAll={clearLocationFilter}
                hasFilter={!!filteredLocation}
                filteredLocation={filteredLocation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section8;
