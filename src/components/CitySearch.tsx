
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { usCities, USCity } from "@/data/usCities";

interface CitySearchProps {
  onCitySelect: (city: USCity) => void;
  onSearch: (query: string) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<USCity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      try {
        const filtered = usCities
          .filter(city => 
            city?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city?.stateCode?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 10); // Limit to 10 suggestions
        
        setFilteredCities(filtered || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error filtering cities:', error);
        setFilteredCities([]);
        setShowSuggestions(false);
      }
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: USCity) => {
    if (!city?.name || !city?.stateCode) return;
    
    setSearchQuery(`${city.name}, ${city.stateCode}`);
    setShowSuggestions(false);
    onCitySelect(city);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="border rounded-lg">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Search by city, state, or PHA name..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
              />
            </div>
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCities.map((city, index) => (
                  <div
                    key={`${city.name}-${city.stateCode}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{city.name}, {city.stateCode}</span>
                    <span className="text-sm text-gray-500 ml-auto">{city.state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={handleSearchClick}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={!searchQuery.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CitySearch;
