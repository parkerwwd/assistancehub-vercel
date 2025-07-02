
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
}

const OfficeDetailsPanel = ({ 
  selectedOffice, 
  onOfficeClick, 
  phaAgencies, 
  loading,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange
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

  // Default empty state
  return <EmptyOfficeState loading={loading} />;
};

export default OfficeDetailsPanel;
