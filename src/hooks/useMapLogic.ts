
import { useState, useEffect, useRef } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USCity } from "@/data/usCities";
import { MapContainerRef } from "@/components/MapContainer";
import { usePHAData } from "./usePHAData";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const useMapLogic = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAAgency | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
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

  // Handle search results when they arrive - don't auto-select, just fly to first result
  useEffect(() => {
    if (currentSearchQuery && phaAgencies.length > 0 && !loading) {
      const firstResult = phaAgencies[0];
      
      // Fly to the first result location if coordinates exist, but don't select it
      if (firstResult.latitude && firstResult.longitude && mapRef.current) {
        mapRef.current.flyTo([firstResult.longitude, firstResult.latitude], 10);
      }
      
      console.log('Search completed, showing', phaAgencies.length, 'results. First result:', firstResult.name);
    }
  }, [phaAgencies, currentSearchQuery, loading]);

  const handlePageChange = (page: number) => {
    if (currentSearchQuery) {
      searchPHAs(currentSearchQuery, page);
    } else {
      goToPage(page);
    }
  };

  const handleCitySelect = async (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Automatically search for PHAs in the selected city
    const searchQuery = `${city.name}, ${city.stateCode}`;
    setCurrentSearchQuery(searchQuery);
    await searchPHAs(searchQuery, 1);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
    }

    // Look for the best matching PHA office from search results
    const cityLower = city.name.toLowerCase().trim();
    const stateLower = city.stateCode.toLowerCase().trim();
    
    // Find exact city matches first, then closest matches
    const exactCityMatch = phaAgencies.find(office => {
      if (!office.city || !office.state) return false;
      
      const officeCityLower = office.city.toLowerCase().trim();
      const officeStateLower = office.state.toLowerCase().trim();
      
      return officeCityLower === cityLower && 
             (officeStateLower === stateLower || 
              officeStateLower === city.state.toLowerCase().substring(0, 2));
    });

    if (exactCityMatch) {
      setSelectedOffice(exactCityMatch);
      console.log('Found exact city match:', exactCityMatch.name);
      
      // Fly to the PHA office if it has coordinates
      if (exactCityMatch.latitude && exactCityMatch.longitude && mapRef.current) {
        mapRef.current.flyTo([exactCityMatch.longitude, exactCityMatch.latitude], 12);
      }
    } else if (phaAgencies.length > 0) {
      // Select the first result from the search
      setSelectedOffice(phaAgencies[0]);
      console.log('Selected first search result:', phaAgencies[0].name);
      
      if (phaAgencies[0].latitude && phaAgencies[0].longitude && mapRef.current) {
        mapRef.current.flyTo([phaAgencies[0].longitude, phaAgencies[0].latitude], 12);
      }
    } else {
      console.log('No PHA offices found for:', city.name, city.stateCode);
      setSelectedOffice(null);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setCurrentSearchQuery("");
      return;
    }
    
    console.log('Searching for:', query);
    setCurrentSearchQuery(query);
    
    // Clear the selected office first to avoid confusion
    setSelectedOffice(null);
    
    // Perform the search - the results will be handled by the effect
    await searchPHAs(query, 1);
  };

  return {
    mapboxToken,
    selectedOffice,
    tokenError,
    showFilters,
    mapRef,
    phaAgencies,
    loading,
    currentPage,
    totalPages,
    totalCount,
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch,
    handlePageChange
  };
};
