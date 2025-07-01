
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
    if (searchQuery.trim().length > 0) {
      const filtered = usCities
        .filter(city => 
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.stateCode.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 suggestions
      
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: USCity) => {
    setSearchQuery(`${city.name}, ${city.stateCode}`);
    setShowSuggestions(false);
    onCitySelect(city);
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Command className="border rounded-lg">
            <CommandInput
              placeholder="Search by city, state, or PHA name..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyPress={handleKeyPress}
              className="border-0"
            />
            {showSuggestions && filteredCities.length > 0 && (
              <CommandList className="absolute top-full left-0 right-0 z-50 bg-white border border-t-0 rounded-b-lg shadow-lg max-h-60">
                <CommandEmpty>No cities found.</CommandEmpty>
                <CommandGroup>
                  {filteredCities.map((city) => (
                    <CommandItem
                      key={`${city.name}-${city.stateCode}`}
                      onSelect={() => handleCitySelect(city)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{city.name}, {city.stateCode}</span>
                      <span className="text-sm text-gray-500 ml-auto">{city.state}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>
        <Button 
          onClick={handleSearchClick}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CitySearch;
