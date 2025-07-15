import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Property } from "@/types/property";
import PropertyHeroSection from "./PropertyDetailView/PropertyHeroSection";
import PropertyBasicInfo from "./PropertyDetailView/PropertyBasicInfo";
import PropertyContactInfo from "./PropertyDetailView/PropertyContactInfo";
import PropertyAmenities from "./PropertyDetailView/PropertyAmenities";
import PropertyAvailability from "./PropertyDetailView/PropertyAvailability";
import PropertyPolicies from "./PropertyDetailView/PropertyPolicies";
import PropertyMapSection from "./PropertyDetailView/PropertyMapSection";
import PropertyOtherInfo from "./PropertyDetailView/PropertyOtherInfo";

interface PropertyDetailViewProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ property, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/20">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Search</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <PropertyHeroSection property={property} />
        </div>

        {/* Content Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content - Full width on mobile */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <PropertyBasicInfo property={property} />

            {/* Contact Information - Moved up for mobile */}
            <div className="lg:hidden">
              <PropertyContactInfo property={property} />
            </div>

            {/* Availability */}
            <PropertyAvailability property={property} />

            {/* Other Information (LIHTC Data) */}
            <PropertyOtherInfo property={property} />

            {/* Map Section */}
            <PropertyMapSection property={property} />

            {/* Amenities */}
            <PropertyAmenities property={property} />
          </div>

          {/* Sidebar - Desktop only for some items */}
          <div className="hidden lg:block space-y-6">
            {/* Contact Information */}
            <PropertyContactInfo property={property} />

            {/* Policies */}
            <PropertyPolicies property={property} />
          </div>

          {/* Policies - Full width on mobile */}
          <div className="lg:hidden">
            <PropertyPolicies property={property} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailView; 