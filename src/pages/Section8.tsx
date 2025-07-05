
import React from 'react';
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import PHADetailView from "@/components/PHADetailView";
import HousingListings from "@/components/HousingListings";
import MapContainer from "@/components/MapContainer";
import Header from "@/components/Header";
import MobileSection8Layout from "@/components/MobileSection8Layout";
import { useMapLogic } from "@/hooks/useMapLogic";
import { useIsMobile } from "@/hooks/use-mobile";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

const Section8 = () => {
  console.log('Section8 component rendering...');
  
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
  } = useMapLogic();

  const [viewState, setViewState] = React.useState<ViewState>('overview');
  const [detailOffice, setDetailOffice] = React.useState<PHAAgency | null>(null);
  const isMobile = useIsMobile();

  const handleOfficeClick = (office: PHAAgency) => {
    console.log('🎯 Office clicked from panel:', office.name);
    
    // First select the office on the map (this will fly to it and show marker)
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
    // Clear the selected office and location to reset the search
    setSelectedOffice(null);
    setSelectedLocation(null);
  };

  const handleBackToPHADetail = () => {
    setViewState('pha-detail');
  };

  const handleHeaderCitySelect = (location: any) => {
    console.log('🏙️ Section8 received location selection:', location);
    handleCitySelect(location);
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
            onShowAll={clearLocationFilter}
            hasFilter={!!filteredLocation}
            filteredLocation={filteredLocation}
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
            viewState={viewState}
            detailOffice={detailOffice}
            setSelectedOffice={setSelectedOffice}
            handleOfficeClick={handleOfficeClick}
            handleViewHousing={handleViewHousing}
            handleBackToOverview={handleBackToOverview}
            handleBackToPHADetail={handleBackToPHADetail}
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
              {renderRightPanel()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section8;
