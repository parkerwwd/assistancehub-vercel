
import React from 'react';
import { Database } from "@/integrations/supabase/types";
import OfficeDetailCard from "./OfficeDetailCard";
import PHAOfficeCard from "./PHAOfficeCard";
import EmptyOfficeState from "./EmptyOfficeState";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface OfficeDetailsPanelProps {
  selectedOffice?: PHAAgency | null;
  onOfficeClick?: (office: PHAAgency) => void;
  phaAgencies: PHAAgency[];
  loading: boolean;
}

const OfficeDetailsPanel = ({ selectedOffice, onOfficeClick, phaAgencies, loading }: OfficeDetailsPanelProps) => {
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
      <div className="h-full overflow-y-auto">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">PHA Offices</h3>
          <p className="text-sm text-gray-600 mt-1">{phaAgencies.length} offices found</p>
        </div>
        
        <div className="p-4 space-y-3">
          {phaAgencies.map((agency) => (
            <PHAOfficeCard 
              key={agency.id}
              agency={agency}
              onOfficeClick={onOfficeClick}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default empty state
  return <EmptyOfficeState loading={loading} />;
};

export default OfficeDetailsPanel;
