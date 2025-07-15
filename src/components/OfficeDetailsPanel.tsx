
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
import { Badge } from "@/components/ui/badge";

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
  
  // Include selected property in the list if it's not already there
  const visibleProperties = React.useMemo(() => {
    const baseProperties = filteredProperties.slice(0, 10);
    
    // If there's a selected property that's not in the visible list, add it at the beginning
    if (selectedOffice && 'property_type' in selectedOffice) {
      const isAlreadyVisible = baseProperties.some(p => p.id === selectedOffice.id);
      if (!isAlreadyVisible) {
        console.log('📌 Adding selected property to visible list:', selectedOffice.name);
        return [selectedOffice as Property, ...baseProperties.slice(0, 9)];
      }
    }
    
    return baseProperties;
  }, [filteredProperties, selectedOffice]);
  
  console.log('📊 OfficeDetailsPanel render:', {
    selectedOfficeId: selectedOffice?.id,
    selectedOfficeName: selectedOffice?.name,
    isProperty: selectedOffice && !('supports_hcv' in selectedOffice),
    propertiesCount: visibleProperties.length,
    phasCount: phaAgencies.length
  });
  
  // Include selected PHA in the list if it's not already there
  const visiblePHAs = React.useMemo(() => {
    // If there's a selected PHA that's not in the visible list, add it at the beginning
    if (selectedOffice && 'supports_hcv' in selectedOffice) {
      const isAlreadyVisible = phaAgencies.some(p => p.id === selectedOffice.id);
      if (!isAlreadyVisible) {
        console.log('📌 Adding selected PHA to visible list:', selectedOffice.name);
        return [selectedOffice as PHAAgency, ...phaAgencies];
      }
    }
    
    return phaAgencies;
  }, [phaAgencies, selectedOffice]);
  
  // Sort PHAs to put selected one first
  const sortedPHAAgencies = React.useMemo(() => {
    if (!selectedOffice || !('supports_hcv' in selectedOffice)) {
      console.log('🔄 Not sorting PHAs - no PHA selected');
      return visiblePHAs;
    }
    
    const selectedIndex = visiblePHAs.findIndex(pha => pha.id === selectedOffice.id);
    console.log('🔄 Sorting PHAs:', {
      selectedId: selectedOffice.id,
      selectedName: selectedOffice.name,
      foundIndex: selectedIndex,
      totalPHAs: visiblePHAs.length
    });
    
    if (selectedIndex === -1) {
      console.log('❌ Selected PHA not found in list!');
      return visiblePHAs;
    }
    
    // Move selected to front
    const sorted = [
      visiblePHAs[selectedIndex],
      ...visiblePHAs.slice(0, selectedIndex),
      ...visiblePHAs.slice(selectedIndex + 1)
    ];
    console.log('✅ Moved PHA to top:', sorted[0].name);
    return sorted;
  }, [visiblePHAs, selectedOffice]);
  
  // Sort properties to put selected one first
  const sortedProperties = React.useMemo(() => {
    if (!selectedOffice || 'supports_hcv' in selectedOffice) {
      console.log('🔄 Not sorting properties - no property selected');
      return visibleProperties; // Use visibleProperties here
    }
    
    const selectedIndex = visibleProperties.findIndex(prop => prop.id === selectedOffice.id); // Use visibleProperties here
    console.log('�� Sorting properties:', {
      selectedId: selectedOffice.id,
      selectedName: selectedOffice.name,
      foundIndex: selectedIndex,
      totalProperties: visibleProperties.length
    });
    
    if (selectedIndex === -1) {
      console.log('❌ Selected property not found in list!');
      return visibleProperties; // Use visibleProperties here
    }
    
    // Move selected to front
    const sorted = [
      visibleProperties[selectedIndex], // Use visibleProperties here
      ...visibleProperties.slice(0, selectedIndex), // Use visibleProperties here
      ...visibleProperties.slice(selectedIndex + 1) // Use visibleProperties here
    ];
    console.log('✅ Moved property to top:', sorted[0].name);
    return sorted;
  }, [visibleProperties, selectedOffice]);
  
  // Scroll to top when selection changes
  React.useEffect(() => {
    if (selectedOffice) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        // Find the scrollable container - it's the div with overflow-y-auto
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        scrollContainers.forEach(container => {
          // Check if this container has our panel
          if (container.querySelector('.office-details-panel-scroll')) {
            container.scrollTop = 0;
            console.log('📜 Scrolled to top for selected item:', selectedOffice.name);
          }
        });
      }, 100);
    }
  }, [selectedOffice]);
  
  // Determine if selected office is a property
  const selectedProperty = selectedOffice && 'property_type' in selectedOffice ? selectedOffice as Property : null;
  const selectedPHA = selectedOffice && 'supports_hcv' in selectedOffice ? selectedOffice as PHAAgency : null;
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 OfficeDetailsPanel props update:', {
      timestamp: new Date().toISOString(),
      filteredLocationName: filteredLocation?.name || 'null',
      phaAgenciesCount: phaAgencies.length,
      propertiesCount: visibleProperties.length,
      hasFilter: hasFilter,
      selectedOffice: selectedOffice?.name || null,
      selectedProperty: selectedProperty?.name || null,
      showPHAs,
      showProperties
    });
  }, [filteredLocation, phaAgencies.length, visibleProperties.length, hasFilter, selectedOffice, selectedProperty, showPHAs, showProperties]);

  // Calculate total items
  const totalItems = (showPHAs ? phaAgencies.length : 0) + (showProperties ? visibleProperties.length : 0);

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
            hasFilter={hasFilter}
            filteredLocation={filteredLocation}
          />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white office-details-panel-scroll">
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
                ? `Showing ${phaAgencies.length} PHAs and ${visibleProperties.length} properties`
                : showPHAs
                ? `${totalCount} Public Housing Agencies`
                : `${visibleProperties.length} Properties`
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
        {showPHAs && sortedPHAAgencies.map((office, index) => (
          <div key={office.id} className="relative">
            {index === 0 && selectedOffice?.id === office.id && (
              <div className="absolute -top-2 right-2 z-10">
                <Badge className="bg-blue-600 text-white text-xs">Selected</Badge>
              </div>
            )}
            <PHAOfficeCard
              agency={office}
              onOfficeClick={() => onOfficeClick(office)}
              isSelected={selectedOffice?.id === office.id}
            />
          </div>
        ))}
        
        {/* Show properties if enabled */}
        {showProperties && sortedProperties.map((property, index) => {
          const isPropertySelected = selectedOffice?.id === property.id;
          console.log('🔍 Property selection check:', {
            propertyId: property.id,
            selectedOfficeId: selectedOffice?.id,
            isMatch: isPropertySelected,
            propertyIdType: typeof property.id,
            selectedIdType: typeof selectedOffice?.id
          });
          return (
            <div key={property.id} className="relative">
              {index === 0 && isPropertySelected && (
                <div className="absolute -top-2 right-2 z-10">
                  <Badge className="bg-red-600 text-white text-xs">Selected</Badge>
                </div>
              )}
              <PropertyCard
                property={property}
                onPropertyClick={() => onOfficeClick(property)}
                isSelected={isPropertySelected}
              />
            </div>
          );
        })}
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
