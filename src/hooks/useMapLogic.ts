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

  const handlePageChange = (page: number) => {
    if (currentSearchQuery) {
      searchPHAs(currentSearchQuery, page);
    } else {
      goToPage(page);
    }
  };

  const handleCitySelect = (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
    }

    // Look for nearby PHA offices with improved matching
    const nearbyOffices = phaAgencies.filter(office => {
      if (!office.city || !office.state) return false;
      
      const officeCityLower = office.city.toLowerCase().trim();
      const officeStateLower = office.state.toLowerCase().trim();
      const cityLower = city.name.toLowerCase().trim();
      const stateLower = city.stateCode.toLowerCase().trim();
      
      // Match by city name and state code
      const cityMatch = officeCityLower === cityLower || 
                       officeCityLower.includes(cityLower) || 
                       cityLower.includes(officeCityLower);
      
      const stateMatch = officeStateLower === stateLower || 
                        officeStateLower === city.state.toLowerCase().substring(0, 2);
      
      return cityMatch && stateMatch;
    });

    // Sort by distance if we have coordinates
    if (nearbyOffices.length > 0) {
      const sortedOffices = nearbyOffices.sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
        
        const distA = Math.sqrt(
          Math.pow(city.latitude - a.latitude, 2) + 
          Math.pow(city.longitude - a.longitude, 2)
        );
        const distB = Math.sqrt(
          Math.pow(city.latitude - b.latitude, 2) + 
          Math.pow(city.longitude - b.longitude, 2)
        );
        
        return distA - distB;
      });
      
      setSelectedOffice(sortedOffices[0]);
      console.log('Found nearby PHA office:', sortedOffices[0].name);
      
      // Fly to the PHA office if it has coordinates
      if (sortedOffices[0].latitude && sortedOffices[0].longitude && mapRef.current) {
        mapRef.current.flyTo([sortedOffices[0].longitude, sortedOffices[0].latitude], 12);
      }
    } else {
      console.log('No nearby PHA offices found for:', city.name, city.stateCode);
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
    await searchPHAs(query, 1);
    
    // Parse the search query to extract city and state
    const queryParts = query.split(',').map(part => part.trim());
    let searchCity = '';
    let searchState = '';
    
    if (queryParts.length >= 2) {
      searchCity = queryParts[0].toLowerCase();
      searchState = queryParts[1].toLowerCase();
    } else {
      // Single term search - could be city or state
      const singleTerm = query.toLowerCase().trim();
      searchCity = singleTerm;
      searchState = singleTerm;
    }
    
    // Filter results based on location relevance
    const filteredResults = phaAgencies.filter(agency => {
      if (!agency.city && !agency.state && !agency.name) return false;
      
      const agencyCity = (agency.city || '').toLowerCase();
      const agencyState = (agency.state || '').toLowerCase();
      const agencyName = (agency.name || '').toLowerCase();
      
      // Check if search query matches city, state, or name
      const nameMatch = agencyName.includes(query.toLowerCase());
      const cityMatch = searchCity && agencyCity.includes(searchCity);
      const stateMatch = searchState && (
        agencyState.includes(searchState) || 
        agencyState === searchState.substring(0, 2)
      );
      
      return nameMatch || cityMatch || stateMatch;
    });
    
    // If we have filtered results, select the most relevant one
    if (filteredResults.length > 0) {
      // Prioritize exact city matches, then state matches, then name matches
      const exactCityMatch = filteredResults.find(agency => 
        agency.city?.toLowerCase() === searchCity
      );
      
      const selectedResult = exactCityMatch || filteredResults[0];
      setSelectedOffice(selectedResult);
      
      if (selectedResult.latitude && selectedResult.longitude && mapRef.current) {
        mapRef.current.flyTo([selectedResult.longitude, selectedResult.latitude], 12);
      }
      
      console.log('Selected search result:', selectedResult.name);
    } else {
      console.log('No relevant results found for search:', query);
      setSelectedOffice(null);
    }
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
