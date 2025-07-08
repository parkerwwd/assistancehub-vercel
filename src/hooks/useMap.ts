import { useRef, useCallback } from 'react';
import { USLocation } from "@/data/usLocations";
import { MapContainerRef } from "@/components/MapContainer";
import { useSearchMap } from "@/contexts/SearchMapContext";
import { geocodePHAAddress } from "@/services/geocodingService";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export interface UseMapReturn {
  // Map ref
  mapRef: React.RefObject<MapContainerRef>;
  
  // Actions
  flyToLocation: (location: USLocation) => void;
  flyToOffice: (office: PHAAgency) => void;
  resetToUSView: () => void;
  handleLocationSearch: (location: USLocation) => void;
  handleOfficeSelection: (office: PHAAgency | null, shouldFlyTo?: boolean) => void;
}

export const useMap = (): UseMapReturn => {
  const mapRef = useRef<MapContainerRef>(null);
  const { actions } = useSearchMap();
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
  
  // Fly to a specific location with appropriate zoom
  const flyToLocation = useCallback((location: USLocation) => {
    if (!mapRef.current) return;
    
    // Determine appropriate zoom level based on location type
    let zoomLevel = 12; // Default zoom for most searches
    
    if (location.type === 'state') {
      zoomLevel = 6.5; // Wider view for states
    } else if (location.type === 'county') {
      zoomLevel = 10; // County-level zoom
    } else if (location.type === 'city') {
      zoomLevel = 12; // City-level zoom - focused but shows surrounding area
    } else if (location.type === 'zip') {
      zoomLevel = 13; // ZIP code level - more focused
    }
    
    mapRef.current.flyTo([location.longitude, location.latitude], zoomLevel);
  }, []);
  
  // Fly to a specific office
  const flyToOffice = useCallback(async (office: PHAAgency) => {
    if (!mapRef.current) return;
    
    let lat, lng;
    
    // Get office coordinates
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
    if (lat && lng) {
      mapRef.current.flyTo([lng, lat], 15);
    }
  }, [mapboxToken]);
  
  // Reset to US overview
  const resetToUSView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([-95.7129, 37.0902], 4);
  }, []);
  
  // Handle location search - sets location filter and flies to location
  const handleLocationSearch = useCallback((location: USLocation) => {
    console.log('🔍 useMap.handleLocationSearch called with:', {
      name: location.name,
      type: location.type,
      lat: location.latitude,
      lng: location.longitude,
      stateCode: location.stateCode
    });
    
    // Set the search location (this will trigger filtering)
    actions.setSearchLocation(location);
    
    // Fly to the location
    flyToLocation(location);
  }, [actions, flyToLocation]);
  
  // Handle office selection - set selected office and optionally fly to it
  const handleOfficeSelection = useCallback((office: PHAAgency | null, shouldFlyTo = false) => {
    actions.setSelectedOffice(office);
    
    if (office && shouldFlyTo) {
      flyToOffice(office);
    }
  }, [actions, flyToOffice]);
  
  return {
    mapRef,
    flyToLocation,
    flyToOffice,
    resetToUSView,
    handleLocationSearch,
    handleOfficeSelection
  };
}; 