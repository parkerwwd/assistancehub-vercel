
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
          pitch: zoom > 8 ? 60 : 45,
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
      
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      
      locationMarker.current = locationMarkerHelper.current.create({ 
        lat, 
        lng, 
        name, 
        mapboxToken 
      });
      locationMarker.current
        .setPopup(MarkerUtils.createLocationPopup(name))
        .addTo(map.current);
        
      console.log('📍 Added enhanced location marker with correct satellite image for:', name, 'at', { lat, lng });
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
        const marker = new mapboxgl.Marker({
          color: '#ef4444',
          scale: 1.5
        })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'map-popup-3d'
          })
            .setHTML(`
              <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1f2937; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">🏢 ${office.name}</h3>
                ${office.address ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">📍 ${office.address}</p>` : ''}
                ${office.city && office.state ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">🏙️ ${office.city}, ${office.state} ${office.zip || ''}</p>` : ''}
                ${office.phone ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">📞 ${office.phone}</p>` : ''}
                ${office.waitlist_status ? `<p style="margin: 0; font-size: 13px; color: #ef4444; font-weight: 600;">Status: ${office.waitlist_status}</p>` : ''}
              </div>
            `)
        );
        
        marker.getElement().addEventListener('click', () => {
          console.log('🎯 3D Marker clicked:', office.name);
          onOfficeSelect(office);
        });
        
        const element = marker.getElement();
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        element.addEventListener('mouseenter', () => {
          element.style.transform = 'scale(1.8) translateZ(10px)';
          element.style.filter = 'drop-shadow(0 8px 16px rgba(239, 68, 68, 0.4))';
        });
        element.addEventListener('mouseleave', () => {
          element.style.transform = 'scale(1.5)';
          element.style.filter = 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2))';
        });
        
        marker.addTo(map.current);
        officeMarkers.current.push(marker);
        
        console.log('✅ Added 3D marker for selected office:', office.name, 'at', { lat, lng });
      } catch (error) {
        console.warn('⚠️ Failed to add marker for office:', office.name, error);
      }
    } else {
      console.warn('⚠️ No coordinates available for office:', office.name);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    
    console.log('🗺️ MapContainer useEffect - Token:', mapboxToken ? `Present (${mapboxToken.substring(0, 20)}...)` : 'Missing');
    
    // Ensure we have a valid token before proceeding
    if (!mapboxToken || !mapboxToken.trim() || mapboxToken.length < 20) {
      console.error('❌ Invalid or missing Mapbox token:', mapboxToken);
      onTokenError("Invalid Mapbox token. Please check your token configuration.");
      return;
    }

    // Clear any previous error
    onTokenError("");

    try {
      console.log('🗺️ Setting Mapbox access token...');
      
      // Set the access token
      mapboxgl.accessToken = mapboxToken.trim();
      
      // Validate token format
      if (!mapboxToken.startsWith('pk.')) {
        console.error('❌ Invalid token format - should start with pk.');
        onTokenError("Invalid Mapbox token format. Token should start with 'pk.'");
        return;
      }
      
      console.log('🗺️ Creating map instance...');
      
      // Create the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-95.7129, 37.0902],
        zoom: 4,
        pitch: 45,
        bearing: 0,
        minZoom: 3,
        maxZoom: 18,
        antialias: true
      });
      
      console.log('🗺️ Map instance created successfully');
      
      // Add error handling for the map
      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        if (e.error && 'status' in e.error) {
          if (e.error.status === 401) {
            onTokenError("Invalid Mapbox token. Please check your token and try again.");
          } else {
            onTokenError(`Map error (${e.error.status}): ${e.error.message || 'Unknown error'}`);
          }
        } else {
          onTokenError("Error loading map. Please check your token and try again.");
        }
      });
      
      // Add 3D terrain and fog when map loads
      map.current.on('style.load', () => {
        console.log('🗺️ Map style loaded, adding 3D features...');
        
        try {
          // Add terrain source
          map.current?.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          
          // Add 3D terrain
          map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
          
          // Add atmospheric fog
          map.current?.setFog({
            'color': 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          });
          
          // Add sky layer for better 3D effect
          map.current?.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15
            }
          });
          
          console.log('✅ 3D features added successfully');
        } catch (error) {
          console.warn('⚠️ Error adding 3D features:', error);
        }
      });
      
      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        }), 
        'top-right'
      );
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
      // Setup enhanced map events
      MapControls.setupMapEvents(map.current, onTokenError, onBoundsChange);

      console.log('✅ Map initialization complete');

      return () => {
        console.log('🧹 Cleaning up map...');
        clearOfficeMarkers();
        clearLocationMarker();
        map.current?.remove();
      };
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      onTokenError(`Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [mapboxToken, onTokenError, onBoundsChange]);

  // Update marker when selected office changes
  useEffect(() => {
    if (map.current?.loaded()) {
      console.log('🔄 Selected office changed, updating 3D markers');
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
      console.log('🗺️ Selected location changed, adding 3D location marker');
    } else if (map.current?.loaded() && !selectedLocation) {
      clearLocationMarker();
    }
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
        🌐 3D Terrain View
      </div>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
