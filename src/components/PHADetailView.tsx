
import React from 'react';
import { Database } from "@/integrations/supabase/types";
import PHADetailHeader from './PHADetailView/PHADetailHeader';
import PHAMainInfo from './PHADetailView/PHAMainInfo';
import PHAHousingUnits from './PHADetailView/PHAHousingUnits';
import PHAOccupancyStats from './PHADetailView/PHAOccupancyStats';
import PHAFinancialInfo from './PHADetailView/PHAFinancialInfo';
import PHASizeCategories from './PHADetailView/PHASizeCategories';
import PHAContactInfo from './PHADetailView/PHAContactInfo';
import PHAAdminInfo from './PHADetailView/PHAAdminInfo';
import PHADataFooter from './PHADetailView/PHADataFooter';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack }) => {
  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <PHADetailHeader onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Info Card */}
        <PHAMainInfo office={office} onViewHousing={onViewHousing} />

        {/* Housing Units Overview */}
        <PHAHousingUnits office={office} />

        {/* Occupancy & Reporting Statistics */}
        <PHAOccupancyStats office={office} />

        {/* Financial Information */}
        <PHAFinancialInfo office={office} />

        {/* Size Categories */}
        <PHASizeCategories office={office} />

        {/* Contact Information */}
        <PHAContactInfo office={office} />

        {/* Administrative Information */}
        <PHAAdminInfo office={office} />

        {/* Data Source Footer */}
        <PHADataFooter office={office} />
      </div>
    </div>
  );
};

export default PHADetailView;
