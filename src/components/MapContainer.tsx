import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from "@/integrations/supabase/types";
import { MapInitializer } from "./map/MapInitializer";
import { MapMarkerManager } from "./map/MapMarkerManager";
import { Map3DControls } from "./map/Map3DControls";

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
  flyTo: (center: [number, number], zoom: number, options?: any) => void;
  getBounds: () => mapboxgl.LngLatBounds | null;
  setLocationMarker: (lat: number, lng: number, name: string, showHoverCard?: boolean) => void;
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
  const markerManager = useRef<MapMarkerManager>(new MapMarkerManager());

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number, options?: any) => {
      if (map.current) {
        // Use much faster defaults for snappy animations
        const flyToOptions = {
          center,
          zoom,
          duration: 300, // Much faster - 300ms
          curve: 1.2, // Slightly reduced curve for quicker animation
          easing: (t: number) => t, // Linear easing for snappy feel
          essential: true,
          ...options // Allow override of defaults
        };
        
        map.current.flyTo(flyToOptions);
      } else {
        console.warn('⚠️ Map not initialized yet');
      }
    },
    getBounds: () => {
      return map.current?.getBounds() || null;
    },
    setLocationMarker: (lat: number, lng: number, name: string, showHoverCard: boolean = true) => {
      if (!map.current) return;
      markerManager.current.setLocationMarker(map.current, lat, lng, name, mapboxToken, showHoverCard);
    }
  }));

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const mapInstance = MapInitializer.createMap({
      container: mapContainer.current,
      mapboxToken,
      onTokenError,
      onBoundsChange
    });

    if (!mapInstance) return;

    map.current = mapInstance;

    // Setup map load events
    map.current.on('load', () => {
      // Map loaded successfully
    });

    map.current.on('styledata', () => {
      // Map style loaded successfully
    });

    map.current.on('idle', () => {
      // Map initialization complete with 3D features
    });

    // Add 3D controls and features
    Map3DControls.addControls(map.current);
    Map3DControls.setup3DFeatures(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, onTokenError, onBoundsChange]);

  // Update marker when selected office changes
  useEffect(() => {
    if (map.current?.loaded()) {
      markerManager.current.clearOfficeMarkers();
      
      if (selectedOffice) {
        setTimeout(() => {
          markerManager.current.addSelectedOfficeMarker(
            map.current!, 
            selectedOffice, 
            mapboxToken, 
            onOfficeSelect
          );
        }, 100);
      } else {
        markerManager.current.resetToOverviewStyle(map.current);
      }
    }
  }, [selectedOffice, mapboxToken, onOfficeSelect]);

  // Display all PHAs on the map
  useEffect(() => {
    console.log('🗺️ Map data update - PHAs:', phaAgencies?.length || 0, 'Map loaded:', map.current?.loaded(), 'Selected location:', selectedLocation?.name);
    
    if (map.current?.loaded() && !selectedOffice && phaAgencies && phaAgencies.length > 0) {
      console.log('🎯 Displaying all PHAs on map:', phaAgencies.length);
      // Clear existing markers first
      markerManager.current.clearAllAgencyMarkers();
      markerManager.current.clearLocationMarker();
      
      // Always display all PHAs as individual pins
      markerManager.current.displayAllPHAsAsIndividualPins(
        map.current, 
        phaAgencies,
        onOfficeSelect
      );
      
      // If there's a selected location, add its marker too
      if (selectedLocation) {
        console.log('📍 Also adding location marker for:', selectedLocation.name);
        markerManager.current.setLocationMarker(
          map.current,
          selectedLocation.lat,
          selectedLocation.lng,
          selectedLocation.name,
          mapboxToken
        );
      }
    } else if (map.current?.loaded() && selectedOffice) {
      // Clear location search markers when an office is selected
      markerManager.current.clearAllAgencyMarkers();
      markerManager.current.clearLocationMarker();
    }
  }, [phaAgencies, selectedLocation, selectedOffice, mapboxToken, onOfficeSelect]);



  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
        🗺️ Street Map
      </div>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
