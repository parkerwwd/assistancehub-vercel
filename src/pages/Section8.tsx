import React from 'react';
import { useSearchParams } from 'react-router-dom';
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
  
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get('state');
  
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

  // Apply state filter when component mounts or state parameter changes
  React.useEffect(() => {
    if (stateParam) {
      console.log('🏛️ State parameter detected:', stateParam);
      const stateInfo = getStateInfo(stateParam);
      if (stateInfo) {
        // Create a proper location object for the state with real coordinates
        const stateLocation = {
          name: stateParam,
          type: 'state' as const,
          latitude: stateInfo.latitude,
          longitude: stateInfo.longitude,
          stateCode: stateInfo.code
        };
        handleCitySelect(stateLocation);
      }
    }
  }, [stateParam, handleCitySelect]);

  const getStateInfo = (stateName: string): { code: string; latitude: number; longitude: number } | null => {
    const stateInfoMap: { [key: string]: { code: string; latitude: number; longitude: number } } = {
      'Alabama': { code: 'AL', latitude: 32.806671, longitude: -86.791130 },
      'Alaska': { code: 'AK', latitude: 61.370716, longitude: -152.404419 },
      'Arizona': { code: 'AZ', latitude: 33.729759, longitude: -111.431221 },
      'Arkansas': { code: 'AR', latitude: 34.969704, longitude: -92.373123 },
      'California': { code: 'CA', latitude: 36.116203, longitude: -119.681564 },
      'Colorado': { code: 'CO', latitude: 39.059811, longitude: -105.311104 },
      'Connecticut': { code: 'CT', latitude: 41.597782, longitude: -72.755371 },
      'Delaware': { code: 'DE', latitude: 39.318523, longitude: -75.507141 },
      'Florida': { code: 'FL', latitude: 27.766279, longitude: -81.686783 },
      'Georgia': { code: 'GA', latitude: 33.040619, longitude: -83.643074 },
      'Hawaii': { code: 'HI', latitude: 21.094318, longitude: -157.498337 },
      'Idaho': { code: 'ID', latitude: 44.240459, longitude: -114.478828 },
      'Illinois': { code: 'IL', latitude: 40.349457, longitude: -88.986137 },
      'Indiana': { code: 'IN', latitude: 39.849426, longitude: -86.258278 },
      'Iowa': { code: 'IA', latitude: 42.011539, longitude: -93.210526 },
      'Kansas': { code: 'KS', latitude: 38.526600, longitude: -96.726486 },
      'Kentucky': { code: 'KY', latitude: 37.668140, longitude: -84.670067 },
      'Louisiana': { code: 'LA', latitude: 31.169546, longitude: -91.867805 },
      'Maine': { code: 'ME', latitude: 44.693947, longitude: -69.381927 },
      'Maryland': { code: 'MD', latitude: 39.063946, longitude: -76.802101 },
      'Massachusetts': { code: 'MA', latitude: 42.230171, longitude: -71.530106 },
      'Michigan': { code: 'MI', latitude: 43.326618, longitude: -84.536095 },
      'Minnesota': { code: 'MN', latitude: 45.694454, longitude: -93.900192 },
      'Mississippi': { code: 'MS', latitude: 32.741646, longitude: -89.678696 },
      'Missouri': { code: 'MO', latitude: 38.456085, longitude: -92.288368 },
      'Montana': { code: 'MT', latitude: 47.012851, longitude: -110.362566 },
      'Nebraska': { code: 'NE', latitude: 41.125370, longitude: -98.268082 },
      'Nevada': { code: 'NV', latitude: 38.313515, longitude: -117.055374 },
      'New Hampshire': { code: 'NH', latitude: 43.452492, longitude: -71.563896 },
      'New Jersey': { code: 'NJ', latitude: 40.298904, longitude: -74.521011 },
      'New Mexico': { code: 'NM', latitude: 34.840515, longitude: -106.248482 },
      'New York': { code: 'NY', latitude: 42.165726, longitude: -74.948051 },
      'North Carolina': { code: 'NC', latitude: 35.630066, longitude: -79.806419 },
      'North Dakota': { code: 'ND', latitude: 47.528912, longitude: -99.784012 },
      'Ohio': { code: 'OH', latitude: 40.388783, longitude: -82.764915 },
      'Oklahoma': { code: 'OK', latitude: 35.565342, longitude: -96.928917 },
      'Oregon': { code: 'OR', latitude: 44.931109, longitude: -123.029159 },
      'Pennsylvania': { code: 'PA', latitude: 40.590752, longitude: -77.209755 },
      'Rhode Island': { code: 'RI', latitude: 41.680893, longitude: -71.511780 },
      'South Carolina': { code: 'SC', latitude: 33.856892, longitude: -80.945007 },
      'South Dakota': { code: 'SD', latitude: 44.299782, longitude: -99.438828 },
      'Tennessee': { code: 'TN', latitude: 35.747845, longitude: -86.692345 },
      'Texas': { code: 'TX', latitude: 31.054487, longitude: -97.563461 },
      'Utah': { code: 'UT', latitude: 40.150032, longitude: -111.862434 },
      'Vermont': { code: 'VT', latitude: 44.045876, longitude: -72.710686 },
      'Virginia': { code: 'VA', latitude: 37.769337, longitude: -78.169968 },
      'Washington': { code: 'WA', latitude: 47.400902, longitude: -121.490494 },
      'West Virginia': { code: 'WV', latitude: 38.491226, longitude: -80.954570 },
      'Wisconsin': { code: 'WI', latitude: 44.268543, longitude: -89.616508 },
      'Wyoming': { code: 'WY', latitude: 42.755966, longitude: -107.302490 }
    };
    return stateInfoMap[stateName] || null;
  };

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
