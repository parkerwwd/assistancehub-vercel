
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
  
  const { 
    phaAgencies, 
    loading, 
    currentPage,
    totalPages,
    totalCount,
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
    goToPage(page);
  };

  const handleCitySelect = async (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Clear any selected office first
    setSelectedOffice(null);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
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
    handlePageChange
  };
};
