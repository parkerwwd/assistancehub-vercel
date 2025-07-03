
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { USCity } from "@/data/usCities";
import CitySearch from "./CitySearch";

interface HeaderProps {
  onCitySelect?: (city: USCity) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCitySelect, showSearch = false }) => {
  const handleCitySelectFromHeader = (city: USCity) => {
    console.log('🏙️ Header city selected:', city);
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  return (
    <>
      {/* Disclaimer banner */}
      <div className="bg-gray-100 border-b border-gray-200 text-center py-2 px-4">
        <p className="text-sm text-gray-700">
          This site is privately owned and is not affiliated with any government agency.
        </p>
      </div>
      
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                AssistanceHub
              </Link>
            </div>
            
            {/* Search Bar with reduced width */}
            {showSearch && onCitySelect && (
              <div className="flex-1 max-w-lg mx-6">
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-yellow-400 rounded-full px-4 py-2 shadow-sm">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <CitySearch 
                        onCitySelect={handleCitySelectFromHeader}
                        placeholder="City, County, or Zipcode"
                        variant="header"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/section8" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                Section 8
              </Link>
              <Link to="/snap" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                SNAP
              </Link>
              <Link to="/auth" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                Admin Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
