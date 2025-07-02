
import React from 'react';
import { Database } from "@/integrations/supabase/types";
import OfficeDetailCard from "./OfficeDetailCard";
import PHAOfficeCard from "./PHAOfficeCard";
import EmptyOfficeState from "./EmptyOfficeState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
  searchPerformed?: boolean;
  searchQuery?: string;
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
  searchPerformed = false,
  searchQuery = ""
}: OfficeDetailsPanelProps) => {
  // If we have a selected office, show detailed view
  if (selectedOffice) {
    return (
      <OfficeDetailCard 
        office={selectedOffice}
        onOfficeClick={onOfficeClick}
      />
    );
  }

  // If we have multiple PHAs loaded (from search), show clean card list
  if (phaAgencies.length > 0 && !loading) {
    return (
      <div className="h-full overflow-y-auto flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">PHA Offices</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {phaAgencies.length} of {totalCount} offices (Page {currentPage} of {totalPages})
          </p>
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

  // Show no results message if search was performed but returned empty
  if (searchPerformed && phaAgencies.length === 0 && !loading) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No PHA Offices Found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? (
              <>No PHA offices found for "<span className="font-medium">{searchQuery}</span>"</>
            ) : (
              "No PHA offices found matching your search criteria"
            )}
          </p>
          <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="font-medium text-amber-800 mb-1">Data Quality Notice</p>
            <p className="text-amber-700">
              Some PHA records may have incomplete address or city information, which can affect search results. 
              Try searching by PHA name or state instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default empty state
  return <EmptyOfficeState loading={loading} />;
};

export default OfficeDetailsPanel;
