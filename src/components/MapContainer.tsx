
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
  const officeMarkers = useRef<mapboxgl.Marker[]>([]);
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

  // Clear existing office markers
  const clearOfficeMarkers = () => {
    officeMarkers.current.forEach(marker => marker.remove());
    officeMarkers.current = [];
  };

  // Clear location marker
  const clearLocationMarker = () => {
    if (locationMarker.current) {
      locationMarker.current.remove();
      locationMarker.current = null;
    }
  };

  // Add marker for selected office
  const addSelectedOfficeMarker = async (office: PHAAgency) => {
    if (!map.current || !mapboxToken) return;
    
    console.log('📍 Adding marker for selected office:', office.name);
    
    let lat = office.latitude || (office as any).geocoded_latitude;
    let lng = office.longitude || (office as any).geocoded_longitude;
    
    // If no coordinates, try to geocode the address using Mapbox
    if ((!lat || !lng) && office.address) {
      console.log('🗺️ No coordinates found, trying to geocode address:', office.address);
      
      try {
        // Build full address string
        const addressParts = [office.address];
        if (office.city) addressParts.push(office.city);
        if (office.state) addressParts.push(office.state);
        if (office.zip) addressParts.push(office.zip);
        
        const fullAddress = addressParts.join(', ');
        const encodedAddress = encodeURIComponent(fullAddress);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const [geocodedLng, geocodedLat] = data.features[0].center;
            lat = geocodedLat;
            lng = geocodedLng;
            console.log('✅ Geocoded coordinates:', { lat, lng });
          }
        }
      } catch (error) {
        console.warn('⚠️ Geocoding error:', error);
      }
    }
    
    if (lat && lng) {
      try {
        // Create a simple marker with red color for the selected office
        const marker = new mapboxgl.Marker({
          color: '#ef4444', // Red color for selected office
          scale: 1.2
        })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 10px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${office.name}</h3>
                ${office.address ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${office.address}</p>` : ''}
                ${office.city && office.state ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${office.city}, ${office.state} ${office.zip || ''}</p>` : ''}
                ${office.phone ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">📞 ${office.phone}</p>` : ''}
                ${office.waitlist_status ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">Status: ${office.waitlist_status}</p>` : ''}
              </div>
            `)
        );
        
        // Add click handler
        marker.getElement().addEventListener('click', () => {
          console.log('🎯 Marker clicked:', office.name);
          onOfficeSelect(office);
        });
        
        // Add hover effects
        const element = marker.getElement();
        element.style.cursor = 'pointer';
        element.addEventListener('mouseenter', () => {
          element.style.transform = 'scale(1.1)';
        });
        element.addEventListener('mouseleave', () => {
          element.style.transform = 'scale(1.2)';
        });
        
        marker.addTo(map.current);
        officeMarkers.current.push(marker);
        
        console.log('✅ Added marker for selected office:', office.name, 'at', { lat, lng });
      } catch (error) {
        console.warn('⚠️ Failed to add marker for office:', office.name, error);
      }
    } else {
      console.warn('⚠️ No coordinates available for office:', office.name);
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
        clearOfficeMarkers();
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
      console.log('🔄 Selected office changed, updating markers');
      clearOfficeMarkers();
      
      if (selectedOffice) {
        // Add marker after a short delay to ensure map is ready
        setTimeout(() => {
          addSelectedOfficeMarker(selectedOffice);
        }, 100);
      } else {
        console.log('🧹 Cleared all office markers - no office selected');
      }
    }
  }, [selectedOffice, mapboxToken]);

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
