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
    
    console.log('🚁 flyToLocation called with:', {
      name: location.name,
      type: location.type,
      coordinates: [location.longitude, location.latitude],
      state: location.state,
      stateCode: location.stateCode
    });
    
    // Determine appropriate zoom level based on location type
    let zoomLevel = 12; // Default zoom for most searches
    
    if (location.type === 'state') {
      zoomLevel = 6.5; // Wider view for states
    } else if (location.type === 'county') {
      zoomLevel = 9; // County-level zoom - was 10, now 9 for wider view
    } else if (location.type === 'city') {
      zoomLevel = 11; // City zoom - was 14, now 11 to show more surrounding area
    } else if (location.type === 'zip') {
      zoomLevel = 13; // ZIP code level - was 15, now 13 for better context
    }
    
    console.log('🎯 Flying to coordinates:', [location.longitude, location.latitude], 'with zoom:', zoomLevel);
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
    
    // Fly to the location with a small delay to ensure state is updated
    setTimeout(() => {
      console.log('🚁 Now flying to location after state update');
    flyToLocation(location);
    }, 100);
  }, [actions, flyToLocation]);
  
  // Handle office selection - set selected office and optionally fly to it
  const handleOfficeSelection = useCallback((office: PHAAgency | null, shouldFlyTo = false) => {
    console.log('🎯 handleOfficeSelection called:', {
      office: office?.name || 'null',
      shouldFlyTo,
      officeCoords: office ? [office.longitude, office.latitude] : 'no office'
    });
    
    actions.setSelectedOffice(office);
    
    if (office && shouldFlyTo) {
      console.log('✈️ Flying to office location because shouldFlyTo is true');
      flyToOffice(office);
    } else {
      console.log('📌 NOT flying to office - shouldFlyTo is', shouldFlyTo);
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