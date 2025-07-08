
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PHAOfficeCard from "./PHAOfficeCard";
import EmptyOfficeState from "./EmptyOfficeState";
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailsPanelProps {
  selectedOffice: PHAAgency | null;
  onOfficeClick: (office: PHAAgency) => void;
  phaAgencies: PHAAgency[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onShowAll?: () => void;
  hasFilter?: boolean;
  filteredLocation?: USLocation | null;
  onShowMap?: (office?: PHAAgency) => void;
}

const OfficeDetailsPanel: React.FC<OfficeDetailsPanelProps> = ({
  selectedOffice,
  onOfficeClick,
  phaAgencies,
  loading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onShowAll,
  hasFilter,
  filteredLocation,
  onShowMap
}) => {
  // Debug logging
  React.useEffect(() => {
    console.error('📊📊📊 OfficeDetailsPanel props update:', {
      timestamp: new Date().toISOString(),
      filteredLocationName: filteredLocation?.name || 'null',
      phaAgenciesCount: phaAgencies.length,
      hasFilter: hasFilter
    });
    
    // Show first agency to verify we have the right data
    if (phaAgencies.length > 0) {
      console.error('📊 First agency shown:', {
        name: phaAgencies[0].name,
        address: phaAgencies[0].address
      });
    }
  }, [phaAgencies, filteredLocation, hasFilter, totalCount]);
  
  // Show empty state when no agencies are available
  if (phaAgencies.length === 0) {
    return (
      <EmptyOfficeState 
        loading={loading} 
        onShowAll={onShowAll}
        hasFilter={hasFilter}
        filteredLocation={filteredLocation}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Improved mobile spacing */}
      <div className="p-3 sm:p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            PHA Offices
          </h2>
          {hasFilter && onShowAll && (
            <Button
              onClick={onShowAll}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 px-3 py-1.5 text-sm"
            >
              Clear Search
            </Button>
          )}
        </div>
        
        {/* Search context - Better mobile formatting */}
        {hasFilter && filteredLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="text-sm font-medium text-blue-800 mb-1">
              Showing results for:
            </div>
            <div className="text-sm text-blue-700">
              {filteredLocation.type === 'state' && (
                <span>All offices in {filteredLocation.name}</span>
              )}
              {filteredLocation.type === 'city' && (
                <span>Within 25 miles of {filteredLocation.name}, {filteredLocation.stateCode}</span>
              )}
              {filteredLocation.type === 'county' && (
                <span>In {filteredLocation.name}, {filteredLocation.stateCode}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Count display */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </span>
            ) : (
              <span className="font-medium">
                {totalCount.toLocaleString()} office{totalCount !== 1 ? 's' : ''} found
              </span>
            )}
          </p>
          
          {/* Page indicator for mobile */}
          {totalPages > 1 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Office List - Improved mobile spacing */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
          {phaAgencies.map((office, index) => (
            <div key={office.id} className="transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <PHAOfficeCard
                agency={office}
                onOfficeClick={() => onOfficeClick(office)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination - Mobile optimized */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 border-t bg-white shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            
            {/* Page info - Better mobile display */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                {currentPage} / {totalPages}
              </span>
              <div className="hidden sm:block text-xs text-gray-400">
                ({totalCount} total)
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeDetailsPanel;
