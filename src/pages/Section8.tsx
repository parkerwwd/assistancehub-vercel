
import React from 'react';
import { Link } from "react-router-dom";
import MapView from "@/components/MapView";
import MapFilters from "@/components/MapFilters";
import { useMapLogic } from "@/hooks/useMapLogic";

const Section8 = () => {
  const {
    showFilters,
    setShowFilters,
    handleCitySelect,
    handleSearch
  } = useMapLogic();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-900 hover:text-blue-800 transition-colors">
                AssistanceHub
              </Link>
            </div>
            
            {/* Search in header */}
            <div className="flex-1 max-w-2xl mx-8">
              <MapFilters
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onCitySelect={handleCitySelect}
                onSearch={handleSearch}
              />
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/section8" className="text-blue-900 font-medium px-3 py-2 rounded-md bg-blue-50">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                SNAP
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1 h-[calc(100vh-4rem)]">
        <MapView hideSearch={true} />
      </div>
    </div>
  );
};

export default Section8;
