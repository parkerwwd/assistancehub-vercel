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
      
      // Create a better custom marker element for location
      const markerElement = document.createElement('div');
      markerElement.className = 'location-marker-container';
      markerElement.style.cssText = `
        position: relative;
        width: 32px;
        height: 40px;
        cursor: pointer;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        transition: transform 0.2s ease;
      `;
      
      // Add the main pin shape
      const pinShape = document.createElement('div');
      pinShape.style.cssText = `
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      
      // Add the inner dot
      const innerDot = document.createElement('div');
      innerDot.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      `;
      
      // Add pulse animation
      const pulseRing = document.createElement('div');
      pulseRing.className = 'pulse-ring';
      pulseRing.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        border: 2px solid #ef4444;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
        opacity: 0.6;
      `;
      
      // Add CSS animation for pulse
      if (!document.querySelector('#location-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'location-marker-styles';
        style.textContent = `
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 0.8;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.4;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.6);
              opacity: 0;
            }
          }
          .location-marker-container:hover {
            transform: scale(1.1);
          }
        `;
        document.head.appendChild(style);
      }
      
      pinShape.appendChild(innerDot);
      markerElement.appendChild(pulseRing);
      markerElement.appendChild(pinShape);
      
      // Add location marker with custom popup
      locationMarker.current = new mapboxgl.Marker({ 
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: [0, -40],
            closeButton: true,
            className: 'location-popup'
          }).setHTML(`
            <div style="padding: 8px 12px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">📍 ${name}</div>
              <div style="font-size: 12px; color: #6b7280;">Selected Location</div>
            </div>
          `)
        )
        .addTo(map.current);
        
      console.log('📍 Added enhanced location marker for:', name, 'at', { lat, lng });
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
        zoom: 4, // Proper zoom level to show full US like in reference image
        minZoom: 3,
        maxZoom: 18
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

      // Setup map when it loads - show full US view initially
      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully - showing full US view');
        handleBoundsChange();
      });

      // Listen for bounds changes
      map.current.on('moveend', handleBoundsChange);
      map.current.on('zoomend', handleBoundsChange);

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
      // Clear location marker when no location is selected
      if (!selectedLocation) {
        clearLocationMarker();
      }
    }
  }, [selectedLocation]);

  return <div ref={mapContainer} className="w-full h-full" />;
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
