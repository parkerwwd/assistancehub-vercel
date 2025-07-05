
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import PHAHeroSection from "./PHADetailView/PHAHeroSection";
import PHABasicInfo from "./PHADetailView/PHABasicInfo";
import PHAContactInfo from "./PHADetailView/PHAContactInfo";
import PHAHousingPrograms from "./PHADetailView/PHAHousingPrograms";
import PHAWalkScore from "./PHADetailView/PHAWalkScore";
import PHALastUpdated from "./PHADetailView/PHALastUpdated";
import PHADataSource from "./PHADetailView/PHADataSource";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
  onShowMap?: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack, onShowMap }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Search
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 space-y-3">
        {/* Hero Image Section */}
        <PHAHeroSection office={office} />

        {/* Basic Information Section */}
        <PHABasicInfo office={office} onShowMap={onShowMap} />

        {/* Contact Information Section */}
        <PHAContactInfo office={office} />

        {/* Program Information Section */}
        <PHAHousingPrograms office={office} />

        {/* Walk Score Section */}
        <PHAWalkScore />

        {/* Office Details Section */}
        <PHALastUpdated office={office} />

        {/* Data Source Footer */}
        <PHADataSource />
      </div>
    </div>
  );
};

export default PHADetailView;
