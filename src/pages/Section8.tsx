
import React from 'react';
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import { useMapLogic } from "@/hooks/useMapLogic";

const Section8 = () => {
  console.log('Section8 component rendering...');
  
  const {
    handleCitySelect
  } = useMapLogic();

  const handleHeaderCitySelect = (city: any) => {
    console.log('🏙️ Section8 received city selection:', city);
    handleCitySelect(city);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Search */}
      <Header 
        showSearch={true}
        onCitySelect={handleHeaderCitySelect}
      />

      {/* Map Container */}
      <div className="flex-1 overflow-hidden">
        <MapView hideSearch={true} />
      </div>
    </div>
  );
};

export default Section8;
