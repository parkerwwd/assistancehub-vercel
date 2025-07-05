
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { USLocation } from "@/data/usLocations";
import CitySearch from "./CitySearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onCitySelect?: (location: USLocation) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCitySelect, showSearch = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleCitySelectFromHeader = (location: USLocation) => {
    console.log('🏙️ Header location selected:', location);
    if (onCitySelect) {
      onCitySelect(location);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Disclaimer banner */}
      <div className="bg-gray-100 border-b border-gray-200 text-center py-2 px-4">
        <p className="text-sm text-gray-700">
          This site is privately owned and is not affiliated with any government agency.
        </p>
      </div>
      
      <header className="bg-header backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/221b75b2-2ed8-4872-b9ef-18b878e8e8fe.png" 
                  alt="AssistanceHub Logo" 
                  className="h-12 sm:h-16 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop Search Bar - Only show on desktop */}
            {!isMobile && showSearch && onCitySelect && (
              <div className="flex flex-1 max-w-lg mx-6">
                <div className="relative w-full">
                  <div className="flex items-center bg-white border-2 border-yellow-400 rounded-full px-4 py-2 shadow-sm">
                    <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
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
            
            {/* Desktop Navigation - Only show on desktop */}
            {!isMobile && (
              <nav className="flex space-x-4 lg:space-x-8">
                <Link to="/section8" className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/10 text-sm lg:text-base">
                  Section 8
                </Link>
                <Link to="/snap" className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/10 text-sm lg:text-base">
                  SNAP
                </Link>
                <Link to="/auth" className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/10 text-sm lg:text-base">
                  Admin Login
                </Link>
              </nav>
            )}

            {/* Mobile menu button - Only show on mobile */}
            {isMobile && (
              <div>
                <button
                  onClick={toggleMobileMenu}
                  className="text-header-foreground hover:text-yellow-300 transition-colors p-2"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Search Bar - Only show on mobile */}
          {isMobile && showSearch && onCitySelect && (
            <div className="pb-4">
              <div className="relative">
                <div className="flex items-center bg-white border-2 border-yellow-400 rounded-full px-4 py-3 shadow-sm">
                  <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <CitySearch 
                      onCitySelect={handleCitySelectFromHeader}
                      placeholder="Search City, County, or Zipcode"
                      variant="header"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Menu - Only show on mobile when menu is open */}
          {isMobile && isMobileMenuOpen && (
            <div className="border-t border-white/20 py-4">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/section8" 
                  className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-white/10 text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Section 8
                </Link>
                <Link 
                  to="/snap" 
                  className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-white/10 text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SNAP
                </Link>
                <Link 
                  to="/auth" 
                  className="text-header-foreground hover:text-yellow-300 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-white/10 text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
