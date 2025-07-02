
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
}

export interface MapContainerRef {
  flyTo: (center: [number, number], zoom: number) => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  mapboxToken, 
  phaAgencies,
  onOfficeSelect, 
  onTokenError 
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number) => {
      map.current?.flyTo({ center, zoom });
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
      if (agency.latitude && agency.longitude) {
        const marker = new mapboxgl.Marker({
          color: getWaitlistColor(agency.waitlist_status || 'Unknown')
        })
          .setLngLat([agency.longitude, agency.latitude])
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          onOfficeSelect(agency);
          map.current?.flyTo({
            center: [agency.longitude!, agency.latitude!],
            zoom: 12
          });
        });

        markers.current.push(marker);
      }
    });
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
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4
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
      });

      return () => {
        clearMarkers();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      onTokenError("Error initializing map. Please check your token.");
    }
  }, [mapboxToken, onOfficeSelect, onTokenError]);

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
