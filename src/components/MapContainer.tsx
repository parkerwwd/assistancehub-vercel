
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from "@/integrations/supabase/types";
import { LocationMarker } from "./map/LocationMarker";
import { MarkerUtils } from "./map/MarkerUtils";
import { MapControls } from "./map/MapControls";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface MapContainerProps {
  mapboxToken: string;
  phaAgencies: PHAAgency[];
  onOfficeSelect: (office: PHAAgency) => void;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  selectedOffice?: PHAAgency | null;
  selectedLocation?: { lat: number; lng: number; name: string } | null;
}

export interface MapContainerRef {
  flyTo: (center: [number, number], zoom: number) => void;
  getBounds: () => mapboxgl.LngLatBounds | null;
  setLocationMarker: (lat: number, lng: number, name: string) => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  mapboxToken, 
  phaAgencies,
  onOfficeSelect, 
  onTokenError,
  onBoundsChange,
  selectedOffice,
  selectedLocation
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const locationMarkerHelper = useRef<LocationMarker>(new LocationMarker());

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number) => {
      console.log('🗺️ MapContainer.flyTo called with:', { center, zoom });
      if (map.current) {
        map.current.flyTo({ 
          center, 
          zoom,
          duration: 1500,
          essential: true
        });
      } else {
        console.warn('⚠️ Map not initialized yet');
      }
    },
    getBounds: () => {
      return map.current?.getBounds() || null;
    },
    setLocationMarker: (lat: number, lng: number, name: string) => {
      if (!map.current) return;
      
      // Remove existing location marker
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      
      // Create new location marker
      locationMarker.current = locationMarkerHelper.current.create({ lat, lng, name });
      locationMarker.current
        .setPopup(MarkerUtils.createLocationPopup(name))
        .addTo(map.current);
        
      console.log('📍 Added enhanced location marker with hover image for:', name, 'at', { lat, lng });
    }
  }));

  // Clear existing markers
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  // Clear location marker
  const clearLocationMarker = () => {
    if (locationMarker.current) {
      locationMarker.current.remove();
      locationMarker.current = null;
    }
  };

  // Add marker for selected office only
  const addSelectedOfficeMarker = () => {
    if (!map.current || !selectedOffice) return;
    
    clearMarkers();
    
    try {
      console.log('📍 Adding marker for selected office:', selectedOffice.name);
      
      const marker = MarkerUtils.createOfficeMarker(selectedOffice, onOfficeSelect);
      marker.addTo(map.current);
      markers.current.push(marker);
      
      console.log('✅ Added marker for selected office:', selectedOffice.name);
    } catch (error) {
      console.warn('⚠️ Failed to add marker for office:', selectedOffice.name, error);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    // Clear any previous error
    onTokenError("");

    try {
      map.current = MapControls.createMap(mapContainer.current, mapboxToken);
      
      // Add navigation controls
      MapControls.addNavigationControls(map.current);
      
      // Setup map events
      MapControls.setupMapEvents(map.current, onTokenError, onBoundsChange);

      return () => {
        clearMarkers();
        clearLocationMarker();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      onTokenError("Error initializing map. Please check your token.");
    }
  }, [mapboxToken, onOfficeSelect, onTokenError, onBoundsChange]);

  // Update marker when selected office changes
  useEffect(() => {
    if (map.current?.loaded()) {
      console.log('🔄 Selected office changed, updating marker');
      if (selectedOffice) {
        addSelectedOfficeMarker();
      } else {
        clearMarkers();
        console.log('🧹 Cleared all markers - no office selected');
      }
    }
  }, [selectedOffice]);

  // Handle selected location changes
  useEffect(() => {
    if (map.current?.loaded() && selectedLocation) {
      console.log('🗺️ Selected location changed, adding location marker');
    } else if (map.current?.loaded() && !selectedLocation) {
      clearLocationMarker();
    }
  }, [selectedLocation]);

  return <div ref={mapContainer} className="w-full h-full" />;
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
