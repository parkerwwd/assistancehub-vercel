
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

  // Load token from localStorage on component mount, or use provided token
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    const providedToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";
    
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setMapboxToken(providedToken);
      localStorage.setItem('mapbox-token', providedToken);
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

  const handleOfficeSelect = (office: PHAAgency) => {
    console.log('🏢 Selected office:', office.name);
    setSelectedOffice(office);
    
    // Get coordinates from the office data
    const lat = office.latitude || (office as any).geocoded_latitude;
    const lng = office.longitude || (office as any).geocoded_longitude;
    
    console.log('🗺️ Flying to coordinates:', { lat, lng });
    
    // If we have coordinates, fly to them
    if (lat && lng && mapRef.current) {
      mapRef.current.flyTo([lng, lat], 12);
    } else {
      console.warn('⚠️ No coordinates found for office:', office.name);
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
    setSelectedOffice: handleOfficeSelect,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handlePageChange
  };
};
