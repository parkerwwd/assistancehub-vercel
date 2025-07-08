
import { useState, useRef } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";
import { MapContainerRef } from "@/components/MapContainer";
import { usePHAData } from "./usePHAData";
import { geocodePHAAddress } from "@/services/geocodingService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const useMapLogic = () => {
  // Use environment variable for Mapbox token
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const [selectedOffice, setSelectedOffice] = useState<PHAAgency | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<MapContainerRef>(null);

  const {
    phaAgencies,
    allPHAAgencies,
    filteredAgencies,
    filteredLocation,
    loading,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    applyLocationFilter,
    clearLocationFilter
  } = usePHAData();

  // Handle token changes if needed
  const handleTokenChange = (token: string) => {
    if (!token) {
      setTokenError("Mapbox token is required");
    } else {
      setTokenError("");
    }
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleCitySelect = async (location: USLocation) => {
    console.log('🔍 City selected:', location.name, 'Coords:', location.latitude, location.longitude);
    
    // Clear any selected office first
    setSelectedOffice(null);
    
    // Apply location filter to PHA agencies
    applyLocationFilter(location);
    
    // Set selected location for marker
    const locationData = {
      lat: location.latitude,
      lng: location.longitude,
      name: location.type === 'state' ? location.name :
            location.type === 'county' ? `${location.name}, ${location.stateCode}` :
            `${location.name}, ${location.stateCode}`
    };
    console.log('📌 Setting selected location state:', locationData);
    setSelectedLocation(locationData);
    
    // Determine appropriate zoom level based on location type
    let zoomLevel = 10;
    if (location.type === 'state') {
      zoomLevel = 6;
    } else if (location.type === 'county') {
      zoomLevel = 8;
    } else if (location.type === 'city') {
      zoomLevel = 10;
    }

    // Fly to the selected location with appropriate zoom level
    if (mapRef.current) {
      mapRef.current.flyTo([location.longitude, location.latitude], zoomLevel);
      // Don't set marker here - let MapContainer handle it via selectedLocation state
    }
  };

  const handleOfficeSelect = async (office: PHAAgency | null, shouldFlyTo: boolean = false) => {
    if (!office) {
      setSelectedOffice(null);
      return;
    }
    
    console.log('📌 Office selected:', office.name, 'shouldFlyTo:', shouldFlyTo);
    setSelectedOffice(office);
    
    // Only fly to office location if explicitly requested (e.g., from list click)
    if (shouldFlyTo) {
      console.log('🚁 Flying to office location');
      
      // Get or geocode coordinates
      let lat, lng;
      if (office.latitude && office.longitude) {
        lat = office.latitude;
        lng = office.longitude;
      } else {
        // Try to geocode the address
        try {
          const geocoded = await geocodePHAAddress(office.address, mapboxToken);
          if (geocoded) {
            lat = geocoded.lat;
            lng = geocoded.lng;
          }
        } catch (error) {
          console.error('Error geocoding office address:', error);
          return;
        }
      }
      
      // Fly to office location
      if (mapRef.current && lat && lng) {
        mapRef.current.flyTo([lng, lat], 15);
      }
    } else {
      console.log('📌 No flyTo - pin click or already visible');
    }
  };

  const resetToUSView = () => {
    setSelectedLocation(null);
    setSelectedOffice(null);
    clearLocationFilter(); // Clear any location filter
    if (mapRef.current) {
      mapRef.current.flyTo([-95.7129, 37.0902], 4);
    }
  };

  return {
    mapboxToken,
    selectedOffice,
    selectedLocation,
    filteredLocation,
    tokenError,
    showFilters,
    mapRef,
    phaAgencies,
    allPHAAgencies,
    filteredAgencies,
    loading,
    currentPage,
    totalPages,
    totalCount,
    setSelectedOffice: (office: PHAAgency | null) => handleOfficeSelect(office, false), // Pin clicks don't flyTo
    setSelectedOfficeWithFlyTo: (office: PHAAgency | null) => handleOfficeSelect(office, true), // List clicks do flyTo
    setSelectedLocation,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handlePageChange,
    resetToUSView,
    clearLocationFilter
  };
};
