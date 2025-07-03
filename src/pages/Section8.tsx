
import React from 'react';
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import { useMapLogic } from "@/hooks/useMapLogic";

const Section8 = () => {
  console.log('Section8 component rendering...');
  
  const {
    showFilters,
    searchInAreaEnabled,
    setShowFilters,
    handleCitySelect,
    handleSearch,
    handleToggleSearchInArea,
    currentSearchQuery
  } = useMapLogic();

  console.log('Section8 useMapLogic data:', {
    showFilters,
    searchInAreaEnabled,
    currentSearchQuery
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* New Header with Search */}
      <Header 
        showSearch={true}
        onCitySelect={handleCitySelect}
        onSearch={handleSearch}
      />

      {/* Map Container */}
      <div className="flex-1 overflow-hidden">
        <MapView 
          hideSearch={true}
          externalSearchQuery={currentSearchQuery}
          externalSearchPerformed={!!currentSearchQuery}
        />
      </div>
    </div>
  );
};

export default Section8;
