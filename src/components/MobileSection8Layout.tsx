import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import PHADetailView from "@/components/PHADetailView";
import HousingListings from "@/components/HousingListings";
import MapContainer from "@/components/MapContainer";
import { PHAAgency } from "@/types/phaOffice";
import { X } from "lucide-react";

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
  const [showMap, setShowMap] = useState(false);

  const handleShowMap = (office?: PHAAgency) => {
    if (office) {
      setSelectedOffice(office);
    }
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedOffice(null);
  };

  const renderContent = () => {
    switch (viewState) {
      case 'pha-detail':
        return detailOffice ? (
          <PHADetailView 
            office={detailOffice}
            onViewHousing={handleViewHousing}
            onBack={handleBackToOverview}
            onShowMap={() => handleShowMap(detailOffice)}
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
            onShowMap={handleShowMap}
          />
        );
    }
  };

  if (showMap) {
    return (
      <div className="flex flex-col h-full">
        {/* Map Header with Close Button */}
        <div className="flex-shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {selectedOffice ? selectedOffice.name : 'Map View'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseMap}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Full Screen Map */}
        <div className="flex-1">
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
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Full height list - no map */}
      <div className="h-full overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default MobileSection8Layout;
