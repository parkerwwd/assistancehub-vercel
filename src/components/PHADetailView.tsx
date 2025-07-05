
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
import PHAMapSection from "./PHADetailView/PHAMapSection";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADetailViewProps {
  office: PHAAgency;
  onViewHousing: (office: PHAAgency) => void;
  onBack: () => void;
  onShowMap?: () => void;
}

const PHADetailView: React.FC<PHADetailViewProps> = ({ office, onViewHousing, onBack, onShowMap }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Modern Header with Gradient */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
        </div>
      </div>

      {/* Main Content with Increased Width */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section - Full Width */}
        <div className="mb-8">
          <PHAHeroSection office={office} />
        </div>

        {/* Content Grid - Two Column Layout on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <PHABasicInfo office={office} onShowMap={onShowMap} />

            {/* Map Section */}
            <PHAMapSection office={office} />

            {/* Program Information */}
            <PHAHousingPrograms office={office} />

            {/* Walk Score Section */}
            <PHAWalkScore office={office} />
          </div>

          {/* Right Column - Contact & Meta Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <PHAContactInfo office={office} />

            {/* Office Details */}
            <PHALastUpdated office={office} />

            {/* Data Source Footer */}
            <PHADataSource />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHADetailView;
