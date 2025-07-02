
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
  const mapRef = useRef<MapContainerRef>(null);
  
  const { phaAgencies, loading, searchPHAs } = usePHAData();

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

  const handleCitySelect = (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
    }

    // Look for nearby PHA offices
    const nearbyOffice = phaAgencies.find(office => {
      if (!office.city || !office.state) return false;
      
      const officeCityLower = office.city.toLowerCase();
      const officeStateLower = office.state.toLowerCase();
      const cityLower = city.name.toLowerCase();
      const stateLower = city.state.toLowerCase();
      
      return officeCityLower.includes(cityLower) || 
             cityLower.includes(officeCityLower) ||
             (officeStateLower === stateLower.substring(0, 2));
    });

    if (nearbyOffice) {
      setSelectedOffice(nearbyOffice);
      console.log('Found nearby PHA office:', nearbyOffice.name);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    console.log('Searching for:', query);
    await searchPHAs(query);
    
    // If we have results, select the first one and fly to it if it has coordinates
    if (phaAgencies.length > 0) {
      const firstResult = phaAgencies[0];
      setSelectedOffice(firstResult);
      
      if (firstResult.latitude && firstResult.longitude && mapRef.current) {
        mapRef.current.flyTo([firstResult.longitude, firstResult.latitude], 12);
      }
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
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch
  };
};
