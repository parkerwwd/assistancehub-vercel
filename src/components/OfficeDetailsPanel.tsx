
import React from 'react';
import { Database } from "@/integrations/supabase/types";
import OfficeDetailCard from "./OfficeDetailCard";
import PHAOfficeCard from "./PHAOfficeCard";
import EmptyOfficeState from "./EmptyOfficeState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { USLocation } from "@/data/usLocations";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailsPanelProps {
  selectedOffice?: PHAAgency | null;
  onOfficeClick?: (office: PHAAgency) => void;
  phaAgencies: PHAAgency[];
  loading: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onShowAll?: () => void;
  hasFilter?: boolean;
  filteredLocation?: USLocation | null;
}

const OfficeDetailsPanel = ({
  selectedOffice,
  onOfficeClick,
  phaAgencies,
  loading,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onShowAll,
  hasFilter = false,
  filteredLocation
}: OfficeDetailsPanelProps) => {
  console.log('🏢 OfficeDetailsPanel render:', {
    selectedOffice: selectedOffice?.name || 'none',
    phaAgenciesCount: phaAgencies.length,
    loading,
    totalCount
  });

  // If we have a selected office, show detailed view
  if (selectedOffice) {
    console.log('📋 Showing detail view for:', selectedOffice.name);
    return (
      <OfficeDetailCard 
        office={selectedOffice}
        onOfficeClick={onOfficeClick}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have PHAs loaded, show them in a clean card list
  if (phaAgencies.length > 0) {
    return (
      <div className="h-full overflow-y-auto flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                PHA Offices{filteredLocation ? ` in ${filteredLocation.name}` : ''}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {phaAgencies.length} of {totalCount} offices
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
            {hasFilter && onShowAll && (
              <Button
                onClick={onShowAll}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Show All
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {phaAgencies.map((agency) => (
            <PHAOfficeCard 
              key={agency.id}
              agency={agency}
              onOfficeClick={onOfficeClick}
            />
          ))}
        </div>

        {totalPages > 1 && onPageChange && (
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, currentPage - 2);
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  }

  // Default empty state
  return <EmptyOfficeState loading={loading} onShowAll={onShowAll} hasFilter={hasFilter} />;
};

export default OfficeDetailsPanel;
