import React, { useState, useEffect } from 'react';
import { MapPin } from "lucide-react";
import { allUSLocations, USLocation } from "@/data/locations";

interface CitySearchProps {
  onCitySelect: (location: USLocation) => void;
  placeholder?: string;
  variant?: 'default' | 'header';
}

const CitySearch: React.FC<CitySearchProps> = ({ 
  onCitySelect, 
  placeholder = "Search by city, county, state...",
  variant = 'default'
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<USLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      try {
        const filtered = allUSLocations
          .filter(location => {
            const query = searchQuery.toLowerCase();
            return (
              location?.name?.toLowerCase().includes(query) ||
              location?.state?.toLowerCase().includes(query) ||
              location?.stateCode?.toLowerCase().includes(query)
            );
          })
          .sort((a, b) => {
            // Sort by type priority: states first, then counties, then cities
            const typeOrder = { 'state': 0, 'county': 1, 'city': 2 };
            if (typeOrder[a.type] !== typeOrder[b.type]) {
              return typeOrder[a.type] - typeOrder[b.type];
            }
            // Then sort alphabetically
            return a.name.localeCompare(b.name);
          })
          .slice(0, 15); // Show more results since we have comprehensive data
        
        setFilteredLocations(filtered || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error filtering locations:', error);
        setFilteredLocations([]);
        setShowSuggestions(false);
      }
    } else {
      setFilteredLocations([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleLocationSelect = (location: USLocation) => {
    if (!location?.name) return;
    
    let displayName = location.name;
    if (location.type === 'city' || location.type === 'county') {
      displayName = `${location.name}, ${location.stateCode}`;
    }
    
    setSearchQuery(displayName);
    setShowSuggestions(false);
    
    console.log('🏙️ Location selected in CitySearch:', displayName);
    onCitySelect(location);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'state':
        return '🏛️';
      case 'county':
        return '🏞️';
      case 'city':
        return '🏙️';
      default:
        return '📍';
    }
  };

  const getLocationDescription = (location: USLocation) => {
    switch (location.type) {
      case 'state':
        return 'State';
      case 'county':
        return `County, ${location.stateCode}`;
      case 'city':
        return `City, ${location.stateCode}`;
      default:
        return '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
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
        
        {showSuggestions && filteredLocations.length > 0 && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-80 sm:w-96 max-h-80 overflow-y-auto">
            {filteredLocations.map((location, index) => (
              <div
                key={`${location.name}-${location.type}-${location.stateCode}-${index}`}
                onClick={() => handleLocationSelect(location)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{getLocationIcon(location.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">{location.name}</span>
                    {(location.type === 'city' || location.type === 'county') && (
                      <span className="text-gray-500 flex-shrink-0">, {location.stateCode}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getLocationDescription(location)}
                  </div>
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
      
      {showSuggestions && filteredLocations.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-64 overflow-y-auto">
          {filteredLocations.map((location, index) => (
            <div
              key={`${location.name}-${location.type}-${location.stateCode}-${index}`}
              onClick={() => handleLocationSelect(location)}
              className="cursor-pointer flex items-center gap-3 px-3 py-3 text-sm hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <span className="text-lg flex-shrink-0">{getLocationIcon(location.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{location.name}</span>
                  {(location.type === 'city' || location.type === 'county') && (
                    <span className="text-gray-500">, {location.stateCode}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {getLocationDescription(location)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
