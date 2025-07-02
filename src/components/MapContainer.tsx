
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PHAOffice } from "@/types/phaOffice";
import { phaOffices } from "@/data/phaOffices";
import { getWaitlistColor } from "@/utils/mapUtils";

interface MapContainerProps {
  mapboxToken: string;
  onOfficeSelect: (office: PHAOffice) => void;
  onTokenError: (error: string) => void;
}

export interface MapContainerRef {
  flyTo: (center: [number, number], zoom: number) => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  mapboxToken, 
  onOfficeSelect, 
  onTokenError 
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number) => {
      map.current?.flyTo({ center, zoom });
    }
  }));

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

      // Add markers for each PHA office
      map.current.on('load', () => {
        phaOffices.forEach((office) => {
          const marker = new mapboxgl.Marker({
            color: getWaitlistColor(office.waitlistStatus)
          })
            .setLngLat(office.coordinates)
            .addTo(map.current!);

          marker.getElement().addEventListener('click', () => {
            onOfficeSelect(office);
            map.current?.flyTo({
              center: office.coordinates,
              zoom: 12
            });
          });
        });
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      onTokenError("Error initializing map. Please check your token.");
    }
  }, [mapboxToken, onOfficeSelect, onTokenError]);

  return <div ref={mapContainer} className="w-full h-full" />;
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
