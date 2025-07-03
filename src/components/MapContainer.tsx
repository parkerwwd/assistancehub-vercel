
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface MapContainerProps {
  mapboxToken: string;
  phaAgencies: PHAAgency[];
  onOfficeSelect: (office: PHAAgency) => void;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
}

export interface MapContainerRef {
  flyTo: (center: [number, number], zoom: number) => void;
  getBounds: () => mapboxgl.LngLatBounds | null;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  mapboxToken, 
  phaAgencies,
  onOfficeSelect, 
  onTokenError,
  onBoundsChange
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number) => {
      map.current?.flyTo({ center, zoom });
    },
    getBounds: () => {
      return map.current?.getBounds() || null;
    }
  }));

  // Clear existing markers
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  // Add markers for PHA agencies
  const addMarkers = () => {
    if (!map.current) return;
    
    clearMarkers();
    
    phaAgencies.forEach((agency) => {
      // Use original coordinates or geocoded coordinates
      const lat = agency.latitude || (agency as any).geocoded_latitude;
      const lng = agency.longitude || (agency as any).geocoded_longitude;
      
      if (lat && lng) {
        const marker = new mapboxgl.Marker({
          color: getWaitlistColor(agency.waitlist_status || 'Unknown')
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          onOfficeSelect(agency);
          map.current?.flyTo({
            center: [lng, lat],
            zoom: 12
          });
        });

        markers.current.push(marker);
      }
    });
  };

  // Handle bounds change
  const handleBoundsChange = () => {
    if (map.current && onBoundsChange) {
      const bounds = map.current.getBounds();
      onBoundsChange(bounds);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    // Clear any previous error
    onTokenError("");

    try {
      mapboxgl.accessToken = mapboxToken.trim();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-95.7129, 37.0902], // Better center for continental US
        zoom: 4.5 // Increased zoom to focus more on USA
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error && 'status' in e.error && e.error.status === 401) {
          onTokenError("Invalid Mapbox token. Please check your token and try again.");
        } else {
          onTokenError("Error loading map. Please check your token and try again.");
        }
      });

      // Add markers when map loads
      map.current.on('load', () => {
        addMarkers();
        handleBoundsChange();
      });

      // Listen for bounds changes
      map.current.on('moveend', handleBoundsChange);
      map.current.on('zoomend', handleBoundsChange);

      return () => {
        clearMarkers();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      onTokenError("Error initializing map. Please check your token.");
    }
  }, [mapboxToken, onOfficeSelect, onTokenError, onBoundsChange]);

  // Update markers when PHA agencies change
  useEffect(() => {
    if (map.current?.loaded()) {
      addMarkers();
    }
  }, [phaAgencies]);

  return <div ref={mapContainer} className="w-full h-full" />;
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
