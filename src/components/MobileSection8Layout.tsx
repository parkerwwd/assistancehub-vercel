
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import OfficeDetailsPanel from "@/components/OfficeDetailsPanel";
import PHADetailView from "@/components/PHADetailView";
import HousingListings from "@/components/HousingListings";
import MapContainer from "@/components/MapContainer";
import { Database } from "@/integrations/supabase/types";
import { ChevronUp, ChevronDown, MapPin, List } from "lucide-react";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
type ViewState = 'overview' | 'pha-detail' | 'housing-listings';

interface MobileSection8LayoutProps {
  mapboxToken: string;
  selectedOffice: PHAAgency | null;
  filteredLocation: any;
  mapRef: any;
  phaAgencies: PHAAgency[];
  filteredAgencies?: PHAAgency[];
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
  filteredAgencies,
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
  const [sheetHeight, setSheetHeight] = useState<'peek' | 'half' | 'full'>('peek');
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Get sheet height based on state
  const getSheetStyle = () => {
    switch (sheetHeight) {
      case 'peek':
        return { height: '120px', bottom: 0 };
      case 'half':
        return { height: '50vh', bottom: 0 };
      case 'full':
        return { height: 'calc(100vh - 120px)', bottom: 0 }; // Leave room for header
      default:
        return { height: '120px', bottom: 0 };
    }
  };

  // Handle touch/drag events for sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dragDistance = startY - currentY;
    const threshold = 50; // pixels

    if (dragDistance > threshold) {
      // Dragged up
      if (sheetHeight === 'peek') setSheetHeight('half');
      else if (sheetHeight === 'half') setSheetHeight('full');
    } else if (dragDistance < -threshold) {
      // Dragged down
      if (sheetHeight === 'full') setSheetHeight('half');
      else if (sheetHeight === 'half') setSheetHeight('peek');
    }
  };

  const renderContent = () => {
    switch (viewState) {
      case 'pha-detail':
        return detailOffice ? (
          <div className="pb-safe">
            <PHADetailView 
              office={detailOffice}
              onViewHousing={handleViewHousing}
              onBack={handleBackToOverview}
            />
          </div>
        ) : null;
      
      case 'housing-listings':
        return detailOffice ? (
          <div className="pb-safe">
            <HousingListings 
              office={detailOffice}
              onBack={handleBackToPHADetail}
            />
          </div>
        ) : null;
      
      default:
        return (
          <div className="pb-safe">
            <OfficeDetailsPanel
              selectedOffice={selectedOffice}
              onOfficeClick={(office) => {
                handleOfficeClick(office);
                setSheetHeight('half');
              }}
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
        );
    }
  };

  // Auto-open sheet to half when office is selected
  useEffect(() => {
    if (selectedOffice && sheetHeight === 'peek') {
      setSheetHeight('half');
    }
  }, [selectedOffice]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0">
        <MapContainer
          ref={mapRef}
          mapboxToken={mapboxToken}
          phaAgencies={filteredAgencies || phaAgencies}
          onOfficeSelect={handleOfficeClick}
          onTokenError={setTokenError}
          selectedOffice={selectedOffice}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out"
        style={getSheetStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          {/* Sheet Header - Always Visible */}
          <div className="px-4 pb-3 border-b">
            {sheetHeight === 'peek' ? (
              <button 
                onClick={() => setSheetHeight('half')}
                className="w-full flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <List className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {totalCount} Housing Offices
                    </h3>
                    <p className="text-sm text-gray-500">
                      {filteredLocation ? `Near ${filteredLocation.name}` : 'Nationwide'}
                    </p>
                  </div>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {viewState === 'pha-detail' && detailOffice ? detailOffice.name :
                   viewState === 'housing-listings' ? 'Housing Listings' :
                   `${totalCount} Offices Found`}
                </h3>
                <button
                  onClick={() => setSheetHeight(sheetHeight === 'full' ? 'half' : 'peek')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        {sheetHeight !== 'peek' && (
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
            {renderContent()}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant={sheetHeight === 'peek' ? 'default' : 'secondary'}
          className="shadow-lg"
          onClick={() => setSheetHeight(sheetHeight === 'peek' ? 'half' : 'peek')}
        >
          {sheetHeight === 'peek' ? (
            <>
              <List className="w-4 h-4 mr-2" />
              Show List
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Map Only
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileSection8Layout;
