
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import CitySearch from './CitySearch';
import { USLocation } from "@/data/usLocations";

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
      
      <header className="bg-white backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-90 transition-opacity">
                <img 
                  src="/lovable-uploads/221b75b2-2ed8-4872-b9ef-18b878e8e8fe.png" 
                  alt="JetWord AssistanceHub" 
                  className="h-10 sm:h-12 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/section8" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Search Housing
              </Link>
              <Link 
                to="/state/california" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                State List
              </Link>
              <Link 
                to="/snap" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Resources
              </Link>
              <Link 
                to="/data-admin" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                About Us
              </Link>
            </nav>

            {/* Search Bar (when enabled) */}
            {showSearch && !isMobile && (
              <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 min-w-80">
                <Search className="w-4 h-4 text-gray-400" />
                <CitySearch 
                  onCitySelect={handleCitySelectFromHeader} 
                  placeholder="Search by city, state..."
                  variant="header"
                />
              </div>
            )}

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/section8">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Find Housing
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search (when enabled) */}
          {showSearch && isMobile && (
            <div className="pb-4 pt-2">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <Search className="w-4 h-4 text-gray-400" />
                <CitySearch 
                  onCitySelect={handleCitySelectFromHeader} 
                  placeholder="Search by city, state..."
                  variant="header"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/section8"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search Housing
              </Link>
              <Link
                to="/state/california"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                State List
              </Link>
              <Link
                to="/snap"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/data-admin"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <div className="px-3 py-2">
                <Link to="/section8">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Find Housing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
