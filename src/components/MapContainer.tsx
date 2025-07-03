
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
  const markerManager = useRef<MapMarkerManager>(new MapMarkerManager());

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number) => {
      console.log('🗺️ MapContainer.flyTo called with:', { center, zoom });
      if (map.current) {
        map.current.flyTo({
          center,
          zoom,
          duration: 2000,
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
      markerManager.current.setLocationMarker(map.current, lat, lng, name, mapboxToken);
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
      console.log('🗺️ Map loaded successfully! 🎉');
      console.log('🗺️ Map container size:', mapContainer.current?.offsetWidth, 'x', mapContainer.current?.offsetHeight);
    });

    map.current.on('style.load', () => {
      console.log('🗺️ Map style loaded successfully');
    });

    // Add 3D controls and features
    Map3DControls.addControls(map.current);
    Map3DControls.setup3DFeatures(map.current);

    console.log('✅ Map initialization complete with 3D features');

    return () => {
      console.log('🧹 Cleaning up map...');
      markerManager.current.cleanup();
      map.current?.remove();
    };
  }, [mapboxToken, onTokenError, onBoundsChange]);

  // Update marker when selected office changes
  useEffect(() => {
    if (map.current?.loaded()) {
      console.log('🔄 Selected office changed, updating 3D markers');
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
        console.log('🧹 Cleared all office markers - no office selected');
        markerManager.current.resetToOverviewStyle(map.current);
      }
    }
  }, [selectedOffice, mapboxToken, onOfficeSelect]);

  // Handle selected location changes
  useEffect(() => {
    if (map.current?.loaded() && selectedLocation) {
      console.log('🗺️ Selected location changed, adding 3D location marker');
    } else if (map.current?.loaded() && !selectedLocation) {
      markerManager.current.clearLocationMarker();
    }
  }, [selectedLocation]);

  // Handle PHA agencies changes - show markers for all filtered agencies
  useEffect(() => {
    if (map.current?.loaded() && phaAgencies && phaAgencies.length > 0 && !selectedOffice) {
      console.log('🗺️ Updating agency markers for', phaAgencies.length, 'agencies');
      markerManager.current.addAllAgencyMarkers(map.current, phaAgencies, onOfficeSelect);
    } else if (map.current?.loaded() && (!phaAgencies || phaAgencies.length === 0 || selectedOffice)) {
      // Clear agency markers when no agencies or when an office is selected
      markerManager.current.clearAllAgencyMarkers();
    }
  }, [phaAgencies, selectedOffice, onOfficeSelect]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
        🗺️ Map View
      </div>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
