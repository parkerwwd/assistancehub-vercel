
import React from 'react';
import { useState } from 'react';
import { Menu, X, Map, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [showSheet, setShowSheet] = useState(false);

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

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Tab Navigation */}
      <div className="flex border-b bg-white sticky top-0 z-10">
        <Button
          variant={activeTab === 'map' ? 'default' : 'ghost'}
          className="flex-1 rounded-none border-r"
          onClick={() => setActiveTab('map')}
        >
          <Map className="w-4 h-4 mr-2" />
          Map
        </Button>
        <Button
          variant={activeTab === 'list' ? 'default' : 'ghost'}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab('list')}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {/* Map View */}
        <div className={`absolute inset-0 ${activeTab === 'map' ? 'block' : 'hidden'}`}>
          <MapContainer
            ref={mapRef}
            mapboxToken={mapboxToken}
            phaAgencies={phaAgencies}
            onOfficeSelect={handleOfficeClick}
            onTokenError={setTokenError}
            selectedOffice={selectedOffice}
            selectedLocation={selectedLocation}
          />
          
          {/* Floating Action Button for List */}
          <Button
            className="absolute bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
            onClick={() => setShowSheet(true)}
          >
            <List className="w-6 h-6" />
          </Button>
        </div>

        {/* List View */}
        <div className={`absolute inset-0 ${activeTab === 'list' ? 'block' : 'hidden'} bg-white overflow-y-auto`}>
          {renderRightPanel()}
        </div>
      </div>

      {/* Bottom Sheet for List when on Map */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Housing Authorities</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {renderRightPanel()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSection8Layout;
