
import { useState, useRef } from 'react';
import { Database } from "@/integrations/supabase/types";
import { USLocation } from "@/data/usLocations";
import { MapContainerRef } from "@/components/MapContainer";
import { usePHAData } from "./usePHAData";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const useMapLogic = () => {
  // Use your provided token
  const mapboxToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";
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

  // Token is now hardcoded, so this function is a no-op
  const handleTokenChange = (token: string) => {
    console.log('🔑 Token change requested but using hardcoded token:', token ? 'Present' : 'Empty');
    // No-op since we're using a hardcoded token
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleCitySelect = async (location: USLocation) => {
    console.log('🏙️ Selected location:', location.name, location.type);
    
    // Clear any selected office first
    setSelectedOffice(null);
    
    // Set selected location for marker
    const locationData = {
      lat: location.latitude,
      lng: location.longitude,
      name: location.type === 'state' ? location.name : 
            location.type === 'county' ? `${location.name}, ${location.stateCode}` :
            `${location.name}, ${location.stateCode}`
    };
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
      console.log('🗺️ Flying to location coordinates:', { lat: location.latitude, lng: location.longitude, zoom: zoomLevel });
      mapRef.current.flyTo([location.longitude, location.latitude], zoomLevel);
      
      // Add location marker
      setTimeout(() => {
        mapRef.current?.setLocationMarker(location.latitude, location.longitude, locationData.name);
      }, 1000);
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!mapboxToken || !address) return null;
    
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`
      );
      
      if (!response.ok) {
        console.warn('Geocoding API error:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      
      return null;
    } catch (error) {
      console.warn('Geocoding error:', error);
      return null;
    }
  };

  const handleOfficeSelect = async (office: PHAAgency | null) => {
    if (!office) {
      console.log('🏢 Clearing selected office');
      setSelectedOffice(null);
      return;
    }

    console.log('🏢 Selected office:', office.name);
    
    // Set the selected office
    setSelectedOffice(office);
    
    // Clear location marker when selecting an office
    setSelectedLocation(null);
    
    // Get coordinates from the office data
    let lat = office.latitude || (office as any).geocoded_latitude;
    let lng = office.longitude || (office as any).geocoded_longitude;
    
    // If no coordinates, try to geocode the address
    if (!lat || !lng) {
      console.log('🗺️ No coordinates found, trying to geocode address:', office.address);
      
      if (office.address) {
        // Build full address string
        const addressParts = [office.address];
        if (office.city) addressParts.push(office.city);
        if (office.state) addressParts.push(office.state);
        if (office.zip) addressParts.push(office.zip);
        
        const fullAddress = addressParts.join(', ');
        const coordinates = await geocodeAddress(fullAddress);
        
        if (coordinates) {
          lat = coordinates.lat;
          lng = coordinates.lng;
          console.log('✅ Geocoded coordinates:', { lat, lng });
        }
      }
    }
    
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
    setSelectedLocation,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handlePageChange,
    resetToUSView
  };
};
