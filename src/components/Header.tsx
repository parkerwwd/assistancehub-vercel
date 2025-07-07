
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import CitySearch from './CitySearch';
import { USLocation } from "@/data/usLocations";
import logoImage from "@/assets/Black.png";

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
      
      <header className="bg-white backdrop-blur-sm shadow-sm border-b sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-90 transition-opacity">
                <img 
                  src={logoImage} 
                  alt="JetWord AssistanceHub" 
                  className="h-10 sm:h-12 w-auto"
                  onLoad={() => console.log('Logo loaded successfully from imported module')}
                  onError={(e) => {
                    console.error('Logo failed to load from imported module');
                    // Fallback to a simple text logo
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div style="color: #1d4ed8; font-weight: bold; font-size: 20px;">JetWord AssistanceHub</div>';
                  }}
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
          {showSearch && isMobile && !isMobileMenuOpen && (
            <div className="pb-3 pt-2 -mx-4 px-4 bg-white border-b relative z-[70]">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-3 min-h-[48px]">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 relative">
                  <CitySearch 
                    onCitySelect={handleCitySelectFromHeader} 
                    placeholder="Search city, state, ZIP..."
                    variant="header"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src={logoImage} 
                  alt="AssistanceHub" 
                  className="h-8 w-auto"
                />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile Menu Items */}
            <div className="px-4 py-6 space-y-2">
              <Link
                to="/"
                className="block px-4 py-4 text-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/section8"
                className="block px-4 py-4 text-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search Housing
              </Link>
              <Link
                to="/state/california"
                className="block px-4 py-4 text-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                State List
              </Link>
              <Link
                to="/snap"
                className="block px-4 py-4 text-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/data-admin"
                className="block px-4 py-4 text-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              
              {/* Mobile Search (if enabled) */}
              {showSearch && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <CitySearch 
                      onCitySelect={(location) => {
                        handleCitySelectFromHeader(location);
                        setIsMobileMenuOpen(false);
                      }} 
                      placeholder="Search by city..."
                      variant="header"
                    />
                  </div>
                </div>
              )}
              
              {/* Mobile CTA */}
              <div className="pt-6">
                <Link to="/section8" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 text-lg">
                    <Search className="w-5 h-5 mr-2" />
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
