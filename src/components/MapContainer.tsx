
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
  selectedOffice?: PHAAgency | null;
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
  onBoundsChange,
  selectedOffice
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

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
    }
  }));

  // Clear existing markers
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  // Add marker for selected office only
  const addSelectedOfficeMarker = () => {
    if (!map.current || !selectedOffice) return;
    
    clearMarkers();
    
    // Use original coordinates or geocoded coordinates
    const lat = selectedOffice.latitude || (selectedOffice as any).geocoded_latitude;
    const lng = selectedOffice.longitude || (selectedOffice as any).geocoded_longitude;
    
    if (lat && lng) {
      console.log('📍 Adding marker for selected office:', selectedOffice.name, 'at', { lat, lng });
      
      const marker = new mapboxgl.Marker({
        color: getWaitlistColor(selectedOffice.waitlist_status || 'Unknown'),
        scale: 1.0
      })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Add click handler to marker
      marker.getElement().addEventListener('click', () => {
        console.log('🎯 Marker clicked:', selectedOffice.name);
        onOfficeSelect(selectedOffice);
      });

      // Add hover effect
      marker.getElement().style.cursor = 'pointer';
      marker.getElement().addEventListener('mouseenter', () => {
        marker.getElement().style.transform = 'scale(1.1)';
      });
      marker.getElement().addEventListener('mouseleave', () => {
        marker.getElement().style.transform = 'scale(1)';
      });

      markers.current.push(marker);
      
      console.log('✅ Added marker for selected office:', selectedOffice.name);
    } else {
      console.warn('⚠️ No coordinates for selected office:', selectedOffice.name);
    }
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
        center: [-95.7129, 37.0902], // Center on continental US
        zoom: 4.5, // Good zoom level to see the whole US
        minZoom: 3,
        maxZoom: 18
        // Removed projection: 'globe' and pitch for 2D view
      });

      // Add navigation controls
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

      // Setup map when it loads - don't add markers initially
      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully - showing US view in 2D (no markers initially)');
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

  return <div ref={mapContainer} className="w-full h-full" />;
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
