
import React from 'react';
import { Button } from "@/components/ui/button";
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import PHADetailView from "@/components/PHADetailView";
import HousingListings from "@/components/HousingListings";
import MapContainer from "@/components/MapContainer";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

interface MobileSection8LayoutProps {
  mapboxToken: string;
  selectedOffice: PHAAgency | null;
  filteredLocation: any;
  mapRef: any;
  phaAgencies: PHAAgency[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  viewState: ViewState;
  detailOffice: PHAAgency | null;
  setSelectedOffice: (office: PHAAgency | null) => void;
  handleOfficeClick: (office: PHAAgency) => void;
  handleViewHousing: (office: PHAAgency) => void;
  handleBackToOverview: () => void;
  handleBackToPHADetail: () => void;
  handlePageChange: (page: number) => void;
  clearLocationFilter: () => void;
  setTokenError: (error: string | null) => void;
  selectedLocation: any;
}

const MobileSection8Layout: React.FC<MobileSection8LayoutProps> = ({
  mapboxToken,
  selectedOffice,
  filteredLocation,
  mapRef,
  phaAgencies,
  loading,
  currentPage,
  totalPages,
  totalCount,
  viewState,
  detailOffice,
  setSelectedOffice,
  handleOfficeClick,
  handleViewHousing,
  handleBackToOverview,
  handleBackToPHADetail,
  handlePageChange,
  clearLocationFilter,
  setTokenError,
  selectedLocation,
}) => {
  const renderContent = () => {
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

  return (
    <div className="flex flex-col h-full">
      {/* Map Section - Small fixed height */}
      <div className="flex-shrink-0 h-32 w-full border-b border-gray-200">
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

      {/* List Section - Takes remaining space and scrollable */}
      <div className="flex-1 overflow-y-auto bg-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default MobileSection8Layout;
