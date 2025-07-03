
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { usCities, USCity } from "@/data/usCities";

interface CitySearchProps {
  onCitySelect: (city: USCity) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  variant?: 'default' | 'header';
}

const CitySearch: React.FC<CitySearchProps> = ({ 
  onCitySelect, 
  onSearch, 
  placeholder = "Search by city, state, or PHA name...",
  variant = 'default'
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<USCity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      try {
        const filtered = usCities
          .filter(city => 
            city?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city?.stateCode?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8);
        
        setFilteredCities(filtered || []);
        setShowSuggestions(true);
        setSelectedFromList(false); // Reset selection flag when typing
      } catch (error) {
        console.error('Error filtering cities:', error);
        setFilteredCities([]);
        setShowSuggestions(false);
      }
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
      setSelectedFromList(false);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: USCity) => {
    if (!city?.name || !city?.stateCode) return;
    
    const cityQuery = `${city.name}, ${city.stateCode}`;
    setSearchQuery(cityQuery);
    setShowSuggestions(false);
    setSelectedFromList(true);
    
    console.log('🏙️ City selected in CitySearch:', cityQuery);
    
    // Trigger both city selection logic and search
    onCitySelect(city);
    onSearch(cityQuery);
  };

  const handleSearchClick = () => {
    // Only allow search if user has selected from the list
    if (selectedFromList && searchQuery.trim()) {
      console.log('🔍 Search button clicked with selected city:', searchQuery);
      onSearch(searchQuery);
      setShowSuggestions(false);
    } else {
      console.log('❌ Search not allowed - must select from city list');
      // Optionally show a message to user that they must select from the list
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only search if user has selected from list
      if (selectedFromList && searchQuery.trim()) {
        console.log('🔍 Enter key pressed with selected city:', searchQuery);
        handleSearchClick();
      } else {
        console.log('❌ Enter key pressed but no valid selection made');
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    console.log('📝 Input changed to:', value);
    setSearchQuery(value);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 1) {
      setShowSuggestions(true);
    }
  };

  if (variant === 'header') {
    return (
      <div className="relative w-full">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-500 text-base"
        />
        
        {showSuggestions && filteredCities.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredCities.map((city, index) => (
              <div
                key={`${city.name}-${city.stateCode}-${index}`}
                onClick={() => handleCitySelect(city)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{city.name}, {city.stateCode}</span>
                  <span className="text-gray-500 ml-2 hidden sm:inline">{city.state}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full h-9 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
          />
          
          {showSuggestions && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredCities.map((city, index) => (
                <div
                  key={`${city.name}-${city.stateCode}-${index}`}
                  onClick={() => handleCitySelect(city)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{city.name}, {city.stateCode}</span>
                    <span className="text-gray-500 ml-2 hidden sm:inline">{city.state}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button 
          onClick={handleSearchClick}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-3 flex-shrink-0"
          disabled={!selectedFromList || !searchQuery.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CitySearch;
