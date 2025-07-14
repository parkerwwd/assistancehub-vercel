
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PHAOfficeCard from "./PHAOfficeCard";
import { PropertyCard } from "./PropertyCard";
import EmptyOfficeState from "./EmptyOfficeState";
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";
import { Property } from "@/types/property";
import { useSearchMap } from "@/contexts/SearchMapContext";
import { MapToggles } from "./MapToggles";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailsPanelProps {
  selectedOffice: PHAAgency | Property | null;
  onOfficeClick: (office: PHAAgency | Property | null) => void;
  phaAgencies: PHAAgency[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
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
  hasFilter,
  filteredLocation,
  onShowMap
}) => {
  // Get property data and toggle states from context
  const { state } = useSearchMap();
  const { showPHAs, showProperties, filteredProperties } = state;
  
  // Paginate properties (simple approach - just take first 10 for now)
  const paginatedProperties = filteredProperties.slice(0, 10);
  
  // Determine if selected office is a property
  const selectedProperty = selectedOffice && 'property_type' in selectedOffice ? selectedOffice as Property : null;
  const selectedPHA = selectedOffice && 'supports_hcv' in selectedOffice ? selectedOffice as PHAAgency : null;
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 OfficeDetailsPanel props update:', {
      timestamp: new Date().toISOString(),
      filteredLocationName: filteredLocation?.name || 'null',
      phaAgenciesCount: phaAgencies.length,
      propertiesCount: paginatedProperties.length,
      hasFilter: hasFilter,
      selectedOffice: selectedOffice?.name || null,
      selectedProperty: selectedProperty?.name || null,
      showPHAs,
      showProperties
    });
  }, [filteredLocation, phaAgencies.length, paginatedProperties.length, hasFilter, selectedOffice, selectedProperty, showPHAs, showProperties]);

  // Calculate total items
  const totalItems = (showPHAs ? phaAgencies.length : 0) + (showProperties ? paginatedProperties.length : 0);

  // Handle property click
  const handlePropertyClick = (property: Property) => {
    console.log('🏠 Property clicked:', property.name);
    // For now, just log - we'll implement property details later
  };

  if (loading) {
    return (
      <div className="p-6 bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Loading locations...
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="p-6 bg-white">
                  <EmptyOfficeState 
            loading={false}
            onShowAll={() => {}}
            hasFilter={hasFilter}
            filteredLocation={filteredLocation}
          />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {hasFilter && filteredLocation?.name 
              ? `Locations in ${filteredLocation.name}`
              : 'Search for a location'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {hasFilter
              ? showPHAs && showProperties
                ? `Showing ${phaAgencies.length} PHAs and ${paginatedProperties.length} properties`
                : showPHAs
                ? `${totalCount} Public Housing Agencies`
                : `${paginatedProperties.length} Properties`
              : 'Enter a city, county, or state to find housing assistance'}
          </p>
        </div>
      </div>

      {/* Filter toggles - only show when there's data */}
      {hasFilter && (
        <div className="mb-4">
          <MapToggles />
        </div>
      )}

      {/* List of offices and properties */}
      <div className="space-y-3 mb-4">
        {/* Show PHAs if enabled */}
        {showPHAs && phaAgencies.map((office) => (
          <PHAOfficeCard
            key={office.id}
            agency={office}
            onOfficeClick={() => onOfficeClick(office)}
          />
        ))}
        
        {/* Show properties if enabled */}
        {showProperties && paginatedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPropertyClick={() => onOfficeClick(property)}
          />
        ))}
      </div>

      {/* Show message if nothing is visible due to toggles */}
      {!showPHAs && !showProperties && (
        <div className="text-center py-8 text-gray-500">
          <p>Please enable at least one layer type (Properties or PHAs) to see results.</p>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default OfficeDetailsPanel;
