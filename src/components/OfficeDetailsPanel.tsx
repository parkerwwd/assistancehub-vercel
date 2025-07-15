
import React, { useState, useEffect, useRef } from 'react';
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
  // State
  const [expandedOfficeId, setExpandedOfficeId] = useState<string | null>(null);
  const { state, actions } = useSearchMap();
  const { filteredProperties, showPHAs, showProperties } = state;
  const [visibleItemCount, setVisibleItemCount] = useState(20);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // Check if mobile
  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 10 : 20;
  
  // Visible items based on pagination and lazy loading
  const visiblePHAs = React.useMemo(() => {
    if (!showPHAs) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, phaAgencies.length);
    return phaAgencies.slice(startIndex, endIndex);
  }, [phaAgencies, currentPage, itemsPerPage, showPHAs]);
  
  const visibleProperties = React.useMemo(() => {
    if (!showProperties) return [];
    // On mobile, use lazy loading; on desktop, show all
    return isMobile ? filteredProperties.slice(0, visibleItemCount) : filteredProperties;
  }, [filteredProperties, visibleItemCount, isMobile, showProperties]);
  
  // Setup intersection observer for lazy loading on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && visibleItemCount < filteredProperties.length) {
          // Load more items
          setVisibleItemCount(prev => Math.min(prev + 10, filteredProperties.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, visibleItemCount, filteredProperties.length]);
  
  // Reset visible items when filters change
  useEffect(() => {
    setVisibleItemCount(20);
  }, [filteredProperties, showProperties]);
  
  console.log('📊 OfficeDetailsPanel render:', {
    selectedOfficeId: selectedOffice?.id,
    selectedOfficeName: selectedOffice?.name,
    isProperty: selectedOffice && !('supports_hcv' in selectedOffice),
    propertiesCount: visibleProperties.length,
    totalPHAsCount: phaAgencies.length,
    visiblePHAsCount: visiblePHAs.length,
    currentPage
  });
  
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
    console.log('🔄 Sorting properties:', {
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
  
  // Create a combined list with selected item at the top
  const combinedItems = React.useMemo(() => {
    const items: Array<{ type: 'pha' | 'property', item: PHAAgency | Property }> = [];
    
    // If a property is selected, add it first
    if (selectedOffice && 'property_type' in selectedOffice) {
      const property = selectedOffice as Property;
      const propertyIndex = visibleProperties.findIndex(p => p.id === property.id);
      if (propertyIndex !== -1) {
        items.push({ type: 'property', item: visibleProperties[propertyIndex] });
        console.log('🔝 Selected property at top:', property.name);
      }
    }
    
    // If a PHA is selected, add it first (unless a property is already selected)
    if (selectedOffice && 'supports_hcv' in selectedOffice) {
      const pha = selectedOffice as PHAAgency;
      if (!(selectedOffice && 'property_type' in selectedOffice) && showPHAs) {
        const phaIndex = visiblePHAs.findIndex(p => p.id === pha.id);
        if (phaIndex !== -1) {
          items.push({ type: 'pha', item: visiblePHAs[phaIndex] });
          console.log('🔝 Selected PHA at top:', pha.name);
        }
      }
    }
    
    // Add remaining PHAs
    if (showPHAs) {
      visiblePHAs.forEach(pha => {
        if (pha.id !== selectedOffice?.id) {
          items.push({ type: 'pha', item: pha });
        }
      });
    }
    
    // Add remaining properties
    if (showProperties) {
      visibleProperties.forEach(property => {
        if (property.id !== selectedOffice?.id) {
          items.push({ type: 'property', item: property });
        }
      });
    }
    
    console.log('📋 Combined items:', {
      total: items.length,
      firstItem: items[0]?.item.name,
      firstItemType: items[0]?.type,
      hasSelectedProperty: !!(selectedOffice && 'property_type' in selectedOffice),
      hasSelectedPHA: !!(selectedOffice && 'supports_hcv' in selectedOffice)
    });
    
    return items;
  }, [visiblePHAs, visibleProperties, selectedOffice, showPHAs, showProperties]);
  
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

  if (totalItems === 0 && (!hasFilter || (showPHAs || showProperties))) {
    return (
      <div className="p-6 bg-white">
        {hasFilter && (
          <div className="mb-4">
            <MapToggles />
          </div>
        )}
        <EmptyOfficeState 
          loading={false}
          hasFilter={hasFilter}
          filteredLocation={filteredLocation}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white office-details-panel-scroll">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {hasFilter && filteredLocation?.name 
              ? `Locations in ${filteredLocation.name}`
              : 'Search for a location'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {hasFilter
              ? showPHAs && showProperties
                ? `Showing ${visiblePHAs.length} PHAs and ${visibleProperties.length} of ${filteredProperties.length} properties`
                : showPHAs
                ? `${totalCount} Public Housing Agencies`
                : `Showing ${visibleProperties.length} of ${filteredProperties.length} Properties`
              : 'Enter a city, county, or state to find housing assistance'}
          </p>
        </div>
      </div>

      {/* Filter toggles - only show when there's data */}
      {hasFilter && (
        <div className="mb-3 sm:mb-4">
          <MapToggles />
        </div>
      )}

      {/* List of offices and properties */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {/* Render combined list */}
        {combinedItems.map((item, index) => {
          const isSelected = selectedOffice?.id === item.item.id;
          
          if (item.type === 'pha') {
            const office = item.item as PHAAgency;
            return (
              <div key={`pha-${office.id}`} className="relative">
                {index === 0 && isSelected && (
                  <div className="absolute -top-2 right-2 z-10">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">Selected</Badge>
                  </div>
                )}
                <PHAOfficeCard
                  agency={office}
                  onOfficeClick={() => onOfficeClick(office)}
                  isSelected={isSelected}
                  searchLocation={state.searchLocation}
                />
              </div>
            );
          } else {
            const property = item.item as Property;
            return (
              <div key={`property-${property.id}`} className="relative">
                {index === 0 && isSelected && (
                  <div className="absolute -top-2 right-2 z-10">
                    <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">Selected</Badge>
                  </div>
                )}
                <PropertyCard
                  property={property}
                  onPropertyClick={() => onOfficeClick(property)}
                  isSelected={isSelected}
                  searchLocation={state.searchLocation}
                />
              </div>
            );
          }
        })}
      </div>

      {/* Show message if nothing is visible due to toggles */}
      {!showPHAs && !showProperties && hasFilter && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm sm:text-base">Please enable at least one layer type (Properties or PHAs) to see results.</p>
        </div>
      )}

      {/* Lazy loading indicator for mobile */}
      {isMobile && showProperties && visibleItemCount < filteredProperties.length && (
        <div ref={loadMoreRef} className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading more properties...</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Showing {visibleItemCount} of {filteredProperties.length} properties
          </p>
        </div>
      )}

      {/* Pagination controls - Mobile Optimized */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          <span className="text-xs sm:text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default OfficeDetailsPanel;
