
import { useState, useEffect, useRef } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USCity } from "@/data/usCities";
import { MapContainerRef } from "@/components/MapContainer";
import { usePHAData } from "./usePHAData";
import { getCityCoordinates } from "@/services/geocodingService";
import { SearchBounds } from "@/services/phaService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const useMapLogic = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAAgency | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [searchInAreaEnabled, setSearchInAreaEnabled] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<SearchBounds | null>(null);
  const mapRef = useRef<MapContainerRef>(null);
  
  const { 
    phaAgencies, 
    loading, 
    currentPage,
    totalPages,
    totalCount,
    searchPHAs,
    goToPage 
  } = usePHAData();

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  // Save token to localStorage whenever it changes
  const handleTokenChange = (token: string) => {
    setMapboxToken(token);
    if (token.trim()) {
      localStorage.setItem('mapbox-token', token.trim());
    } else {
      localStorage.removeItem('mapbox-token');
    }
  };

  // Handle bounds change from map
  const handleBoundsChange = (bounds: mapboxgl.LngLatBounds) => {
    const searchBounds: SearchBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
    setCurrentBounds(searchBounds);
  };

  // Handle search results when they arrive - don't auto-select if no results
  useEffect(() => {
    if (currentSearchQuery && !loading) {
      if (phaAgencies.length > 0) {
        const firstResult = phaAgencies[0];
        
        // Fly to the first result location if coordinates exist, but don't select it
        if (firstResult.latitude && firstResult.longitude && mapRef.current) {
          mapRef.current.flyTo([firstResult.longitude, firstResult.latitude], 10);
        }
        
        console.log('Search completed, showing', phaAgencies.length, 'results. First result:', firstResult.name);
      } else {
        console.log('Search completed with no results for:', currentSearchQuery);
      }
    }
  }, [phaAgencies, currentSearchQuery, loading]);

  const handlePageChange = (page: number) => {
    if (currentSearchQuery) {
      const bounds = searchInAreaEnabled ? currentBounds : undefined;
      searchPHAs(currentSearchQuery, page, bounds);
    } else {
      goToPage(page);
    }
  };

  const handleCitySelect = async (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Automatically search for PHAs in the selected city
    const searchQuery = `${city.name}, ${city.stateCode}`;
    setCurrentSearchQuery(searchQuery);
    
    // Clear any selected office first
    setSelectedOffice(null);
    
    const bounds = searchInAreaEnabled ? currentBounds : undefined;
    await searchPHAs(searchQuery, 1, bounds);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
    }
  };

  const handleSearch = async (query: string, useAreaSearch = false) => {
    if (!query.trim()) {
      setCurrentSearchQuery("");
      return;
    }
    
    console.log('🔍 Searching for:', query, useAreaSearch ? 'in current area' : 'globally');
    setCurrentSearchQuery(query);
    
    // Clear the selected office first to show search results properly
    setSelectedOffice(null);
    
    // Use bounds if area search is enabled
    const bounds = useAreaSearch ? currentBounds : undefined;
    
    // Perform the search
    await searchPHAs(query, 1, bounds);
    
    // Try to center map on searched city
    const cityStatePattern = /^(.+?),?\s+([a-z]{2})$/i;
    const cityStateMatch = query.match(cityStatePattern);
    
    if (cityStateMatch) {
      const cityName = cityStateMatch[1].trim();
      const stateCode = cityStateMatch[2].trim();
      
      const cityCoords = await getCityCoordinates(cityName, stateCode);
      if (cityCoords && mapRef.current) {
        mapRef.current.flyTo([cityCoords.longitude, cityCoords.latitude], 10);
      }
    }
  };

  const handleToggleSearchInArea = (enabled: boolean) => {
    setSearchInAreaEnabled(enabled);
    
    // If we have a current search query, re-run the search with the new area setting
    if (currentSearchQuery) {
      const bounds = enabled ? currentBounds : undefined;
      searchPHAs(currentSearchQuery, 1, bounds);
    }
  };

  return {
    mapboxToken,
    selectedOffice,
    tokenError,
    showFilters,
    searchInAreaEnabled,
    mapRef,
    phaAgencies,
    loading,
    currentPage,
    totalPages,
    totalCount,
    currentSearchQuery,
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch,
    handlePageChange,
    handleBoundsChange,
    handleToggleSearchInArea
  };
};
