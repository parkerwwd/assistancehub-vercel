
import { useState, useEffect, useRef } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USCity } from "@/data/usCities";
import { MapContainerRef } from "@/components/MapContainer";
import { usePHAData } from "./usePHAData";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const useMapLogic = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAAgency | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
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
    const providedToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjelhndSJ9.lHDryqr2gOUMzjrHRP-MLA";
    
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
    console.log('🏙️ Selected city:', city.name, city.stateCode);
    
    // Clear any selected office first
    setSelectedOffice(null);
    
    // Set selected location for marker
    const location = {
      lat: city.latitude,
      lng: city.longitude,
      name: `${city.name}, ${city.stateCode}`
    };
    setSelectedLocation(location);
    
    // Fly to the selected city with appropriate zoom level
    if (mapRef.current) {
      console.log('🗺️ Flying to city coordinates:', { lat: city.latitude, lng: city.longitude });
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
      
      // Add location marker
      setTimeout(() => {
        mapRef.current?.setLocationMarker(city.latitude, city.longitude, `${city.name}, ${city.stateCode}`);
      }, 1000);
    }
  };

  const handleOfficeSelect = (office: PHAAgency) => {
    console.log('🏢 Selected office:', office.name);
    setSelectedOffice(office);
    
    // Clear location marker when selecting an office
    setSelectedLocation(null);
    
    // Get coordinates from the office data
    const lat = office.latitude || (office as any).geocoded_latitude;
    const lng = office.longitude || (office as any).geocoded_longitude;
    
    console.log('🗺️ Flying to office coordinates:', { lat, lng });
    
    // If we have coordinates, fly to them with closer zoom
    if (lat && lng && mapRef.current) {
      mapRef.current.flyTo([lng, lat], 14);
    } else {
      console.warn('⚠️ No coordinates found for office:', office.name);
    }
  };

  const resetToUSView = () => {
    console.log('🇺🇸 Resetting to US view');
    setSelectedOffice(null);
    setSelectedLocation(null);
    if (mapRef.current) {
      // Center on continental US with appropriate zoom to match reference image
      mapRef.current.flyTo([-95.7129, 37.0902], 4);
    }
  };

  return {
    mapboxToken,
    selectedOffice,
    selectedLocation,
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
    handlePageChange,
    resetToUSView
  };
};
