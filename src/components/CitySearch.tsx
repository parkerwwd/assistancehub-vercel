import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Target, X } from "lucide-react";
import { comprehensiveCities, USLocation } from "@/data/locations";

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
  const [filteredLocations, setFilteredLocations] = useState<(USLocation & { zipCode?: string; mapboxId?: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reset search when component remounts or location changes
  useEffect(() => {
    return () => {
      setSearchQuery("");
      setFilteredLocations([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Filter locations based on search input (with Mapbox integration)
  const filterLocations = async (query: string) => {
    if (!query.trim()) {
      setFilteredLocations([]);
      setShowSuggestions(false);
      return;
    }

    // Check if the query is a ZIP code (5 digits or 5+4 format)
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    const isZipCode = zipCodeRegex.test(query.trim());

    if (isZipCode) {
      // For ZIP codes, create a special suggestion
      setFilteredLocations([{
        name: `ZIP Code ${query.trim()}`,
        type: 'city' as const, // Use 'city' type but with zipCode property
        state: 'United States',
        stateCode: 'US',
        latitude: 0, // Will be geocoded later
        longitude: 0, // Will be geocoded later
        zipCode: query.trim()
      }]);
      setShowSuggestions(true);
      return;
    }

    // First, filter local cities for instant results
    const lowerQuery = query.toLowerCase();
    const localCities = comprehensiveCities.filter(city => 
      city.name.toLowerCase().includes(lowerQuery) ||
      city.state.toLowerCase().includes(lowerQuery) ||
      city.stateCode.toLowerCase().includes(lowerQuery)
    );

    // If we have enough local results, use them
    if (localCities.length >= 5) {
      setFilteredLocations(localCities.slice(0, 10));
      setShowSuggestions(true);
      return;
    }

    // Otherwise, use Mapbox geocoding for comprehensive search
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (query.length >= 3 && mapboxToken) { // Only search after 3 characters
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxToken}&` +
          `country=US&` +
          `types=place&` + // Only search for cities/places
          `limit=10`
        );

        if (response.ok) {
          const data = await response.json();
          
          // Convert Mapbox results to our format
          const mapboxCities = data.features
            .filter((feature: any) => feature.place_type.includes('place'))
            .map((feature: any) => {
              const [stateName, stateCode] = feature.context?.find((c: any) => c.id.startsWith('region'))?.text 
                ? [feature.context.find((c: any) => c.id.startsWith('region')).text, 
                   feature.context.find((c: any) => c.id.startsWith('region')).short_code?.replace('US-', '') || '']
                : ['', ''];
              
              return {
                name: feature.text,
                state: stateName,
                stateCode: stateCode.toUpperCase(),
                latitude: feature.center[1],
                longitude: feature.center[0],
                type: 'city' as const,
                mapboxId: feature.id // Keep track of Mapbox results
              };
            });

          // Combine local and Mapbox results, removing duplicates
          const combinedResults = [...localCities];
          mapboxCities.forEach((mapboxCity: any) => {
            if (!combinedResults.some(local => 
              local.name.toLowerCase() === mapboxCity.name.toLowerCase() && 
              local.stateCode === mapboxCity.stateCode
            )) {
              combinedResults.push(mapboxCity);
            }
          });

          setFilteredLocations(combinedResults.slice(0, 10));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching cities from Mapbox:', error);
        // Fall back to local results only
        setFilteredLocations(localCities.slice(0, 10));
        setShowSuggestions(true);
      }
    } else {
      // For short queries, just use local results
      setFilteredLocations(localCities.slice(0, 10));
      setShowSuggestions(true);
    }
  };

  // Handle search input change with debouncing
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // For empty queries, clear immediately
    if (!value.trim()) {
      setFilteredLocations([]);
      setShowSuggestions(false);
      return;
    }
    
    // For non-empty queries, debounce the search
    debounceTimeout.current = setTimeout(() => {
      filterLocations(value);
    }, 300); // 300ms debounce
  };

  // Handle ZIP code geocoding
  const handleZipCodeSearch = async (zipCode: string): Promise<USLocation | null> => {
    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!mapboxToken) {
        console.error('Mapbox token not found');
        return null;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zipCode)}.json?access_token=${mapboxToken}&limit=1&country=US&types=postcode`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;
          const placeName = feature.place_name || feature.text || zipCode;
          
          // Create a location object for the ZIP code
          const zipLocation: USLocation = {
            name: placeName.split(',')[0] || `ZIP ${zipCode}`,
            type: 'city',
            state: 'United States',
            stateCode: 'US',
            latitude: lat,
            longitude: lng
          };
          
          console.log('✅ Geocoded ZIP code:', zipCode, '→', { lat, lng, placeName });
          return zipLocation;
        }
      }
    } catch (error) {
      console.error('❌ Error geocoding ZIP code:', error);
    }
    return null;
  };

  const handleLocationSelect = async (location: USLocation & { zipCode?: string }) => {
    if (!location?.name) return;
    
    // If it's a ZIP code, geocode it first
    if (location.zipCode) {
      const geocodedLocation = await handleZipCodeSearch(location.zipCode);
      if (geocodedLocation) {
        setSearchQuery(location.zipCode);
        setShowSuggestions(false);
        console.log('🔍 ZIP selected, calling onCitySelect');
        onCitySelect(geocodedLocation);
      }
      return;
    }
    
    // For regular locations
    let displayName = location.name;
    if (location.type === 'city' || location.type === 'county') {
      displayName = `${location.name}, ${location.stateCode}`;
    }
    
    setSearchQuery(displayName);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    console.log('🔍 Suggestion selected, calling onCitySelect');
    onCitySelect(location);
  };

  const getLocationIcon = (location: USLocation & { zipCode?: string }) => {
    if (location.zipCode) {
      return '📮';
    }
    switch (location.type) {
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

  const getLocationDescription = (location: USLocation & { zipCode?: string }) => {
    if (location.zipCode) {
      return 'ZIP Code';
    }
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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (showSuggestions && filteredLocations.length > 0) {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < filteredLocations.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        if (showSuggestions && filteredLocations.length > 0) {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredLocations.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && filteredLocations[selectedSuggestionIndex]) {
          // Select from suggestions
          handleLocationSelect(filteredLocations[selectedSuggestionIndex]);
        } else if (searchQuery.trim()) {
          // No suggestion selected but there's text - try to search
          handleDirectSearch(searchQuery.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle direct search when Enter is pressed without selecting a suggestion
  const handleDirectSearch = async (query: string) => {
    console.log('🔍 handleDirectSearch called with:', query);
    
    // Check if it's a ZIP code
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (zipCodeRegex.test(query)) {
      console.log('🔍 Detected ZIP code');
      const geocodedLocation = await handleZipCodeSearch(query);
      if (geocodedLocation) {
        console.log('🔍 ZIP found, calling onCitySelect');
        searchInputRef.current?.blur();
        onCitySelect(geocodedLocation);
      }
      return;
    }
    
    // Try to find in local data first
    console.log('🔍 Searching in local data for:', query);
    const localMatch = comprehensiveCities.find(city => 
      city.name.toLowerCase() === query.toLowerCase() ||
      `${city.name}, ${city.stateCode}`.toLowerCase() === query.toLowerCase()
    );
    
    if (localMatch) {
      console.log('🔍 Local match found:', localMatch);
      setSearchQuery(`${localMatch.name}, ${localMatch.stateCode}`);
      setShowSuggestions(false);
      searchInputRef.current?.blur();
      onCitySelect(localMatch);
      return;
    }
    
    console.log('🔍 No local match, trying Mapbox geocoding...');
    
    // If not found locally, try geocoding with Mapbox
    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (mapboxToken) {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxToken}&` +
          `country=US&` +
          `types=place&` +
          `limit=1`
        );
        
        console.log('🔍 Mapbox response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Mapbox response data:', data);
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lng, lat] = feature.center;
            
            const location: USLocation = {
              name: feature.text || query,
              type: 'city',
              state: feature.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
              stateCode: feature.context?.find((c: any) => c.id.startsWith('region'))?.short_code?.replace('US-', '') || '',
              latitude: lat,
              longitude: lng
            };
            
            console.log('🔍 Mapbox result found:', location);
            setSearchQuery(`${location.name}, ${location.stateCode}`);
            setShowSuggestions(false);
            searchInputRef.current?.blur();
            onCitySelect(location);
          } else {
            console.log('🔍 No features in Mapbox response');
          }
        } else {
          console.log('🔍 Mapbox request failed');
        }
      } else {
        console.log('🔍 No Mapbox token available');
      }
    } catch (error) {
      console.error('🔍 Error geocoding search query:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredLocations([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // Reset all search state - useful for mobile between searches
  const resetSearchState = () => {
    setFilteredLocations([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  };

  const handleInputBlur = () => {
    // Simplified blur handling for mobile
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 1) {
      filterLocations(searchQuery);
    }
    // Scroll input into view on mobile to avoid keyboard overlap
    setTimeout(() => {
      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (variant === 'header') {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-500 text-base min-h-[44px] pr-8 touch-manipulation"
            autoComplete="off"
            inputMode="search"
            style={{ WebkitAppearance: 'none', touchAction: 'manipulation' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-16 p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              aria-label="Clear search"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('🔍 Button clicked, searchQuery:', searchQuery);
              console.log('🔍 searchQuery.trim():', searchQuery.trim());
              
              if (searchQuery.trim()) {
                console.log('🔍 SEARCH: Starting search for:', searchQuery.trim());
                handleDirectSearch(searchQuery.trim());
              } else {
                console.log('🔍 No query to search');
              }
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation whitespace-nowrap min-h-[44px]"
            disabled={!searchQuery.trim()}
            style={{ touchAction: 'manipulation' }}
          >
            Search
          </button>
        </div>
        
        {showSuggestions && filteredLocations.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-w-[calc(100vw-2rem)] mx-auto max-h-[50vh] overflow-y-auto overscroll-contain"
            style={{ width: 'min(24rem, calc(100vw - 2rem))' }}
          >
            {filteredLocations.map((location, index) => (
              <div
                key={`${location.name}-${location.type}-${location.stateCode}-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLocationSelect(location);
                }}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                className={`cursor-pointer flex items-center gap-3 px-4 py-4 text-sm transition-colors touch-manipulation min-h-[44px] ${
                  index === selectedSuggestionIndex
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50 active:bg-gray-100'
                } border-b border-gray-100 last:border-b-0`}
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-lg flex-shrink-0">{getLocationIcon(location)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {location.zipCode || location.name}
                    </span>
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
        ref={searchInputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full h-9 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
        autoComplete="off"
        inputMode="search"
      />
      
      {showSuggestions && filteredLocations.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-w-[calc(100vw-2rem)] mx-auto max-h-[40vh] overflow-y-auto overscroll-contain"
          style={{ width: 'min(20rem, calc(100vw - 2rem))' }}
        >
          {filteredLocations.map((location, index) => (
            <div
              key={`${location.name}-${location.type}-${location.stateCode}-${index}`}
              onClick={() => handleLocationSelect(location)}
              onTouchEnd={() => handleLocationSelect(location)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 text-sm transition-colors touch-manipulation ${
                index === selectedSuggestionIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              } border-b border-gray-100 last:border-b-0`}
            >
              <span className="text-lg flex-shrink-0">{getLocationIcon(location)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {location.zipCode || location.name}
                  </span>
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
