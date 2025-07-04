
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            PHA Offices
          </h2>
          {hasFilter && onShowAll && (
            <Button
              onClick={onShowAll}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              Show All
            </Button>
          )}
        </div>
        
        {/* Show search context */}
        {hasFilter && filteredLocation && (
          <div className="text-sm text-gray-600 mb-2">
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
        )}
        
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${totalCount} office${totalCount !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Office List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {phaAgencies.map((office) => (
            <PHAOfficeCard
              key={office.id}
              agency={office}
              onOfficeClick={() => onOfficeClick(office)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeDetailsPanel;
