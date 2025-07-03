
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
        element.style.transform = 'scale(1.5)'; // Set initial scale
        element.style.filter = 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2))';

        element.addEventListener('mouseenter', () => {
          // Use filter effects instead of scale to avoid marker movement
          element.style.filter = 'drop-shadow(0 8px 16px rgba(239, 68, 68, 0.4)) brightness(1.1) saturate(1.2)';
        });
        element.addEventListener('mouseleave', () => {
          // Reset to original filter
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
    if (!mapboxToken || !mapboxToken.trim() || !mapboxToken.startsWith('pk.')) {
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
      console.log('🗺️ Access token set successfully');
      
      console.log('🗺️ Creating map instance...');
      
      // Create the map with 3D configuration
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Better for 3D with satellite imagery
        center: [-95.7129, 37.0902],
        zoom: 4,
        pitch: 45, // Add 3D tilt
        bearing: 0, // Initial rotation
        antialias: true, // Smooth 3D rendering
        maxPitch: 85 // Allow steep viewing angles
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
      
      // Setup map when style loads
      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully! 🎉');
        console.log('🗺️ Map container size:', mapContainer.current?.offsetWidth, 'x', mapContainer.current?.offsetHeight);
      });

      map.current.on('style.load', () => {
        console.log('🗺️ Map style loaded successfully');
      });

      map.current.on('render', () => {
        console.log('🗺️ Map is rendering...');
      });
      
      // Add navigation controls with enhanced 3D support
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true, // Show pitch control for 3D
          showZoom: true,
          showCompass: true
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add custom 3D toggle control
      const toggle3DControl = {
        onAdd: function(map: mapboxgl.Map) {
          const container = document.createElement('div');
          container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
          container.style.background = 'white';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';

          const button = document.createElement('button');
          button.className = 'mapboxgl-ctrl-icon';
          button.type = 'button';
          button.title = 'Toggle 3D View';
          button.innerHTML = '🏔️';
          button.style.fontSize = '16px';
          button.style.width = '29px';
          button.style.height = '29px';
          button.style.border = 'none';
          button.style.background = 'transparent';
          button.style.cursor = 'pointer';
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.justifyContent = 'center';

          let is3D = true; // Start in 3D mode

          button.addEventListener('click', () => {
            if (is3D) {
              // Switch to 2D
              map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
              button.innerHTML = '🗺️';
              button.title = 'Switch to 3D View';
              is3D = false;
            } else {
              // Switch to 3D
              map.easeTo({ pitch: 45, bearing: 0, duration: 1000 });
              button.innerHTML = '🏔️';
              button.title = 'Switch to 2D View';
              is3D = true;
            }
          });

          container.appendChild(button);
          return container;
        },
        onRemove: function() {
          // Cleanup if needed
        }
      };

      map.current.addControl(toggle3DControl as any, 'top-right');
      
      // Setup enhanced map events
      MapControls.setupMapEvents(map.current, onTokenError, onBoundsChange);

      // Add 3D features when map style loads
      map.current.on('style.load', () => {
        console.log('🏔️ Adding 3D terrain and buildings...');

        // Add terrain source for 3D elevation
        map.current!.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });

        // Set terrain for 3D elevation
        map.current!.setTerrain({
          'source': 'mapbox-dem',
          'exaggeration': 1.5 // Make terrain more dramatic
        });

        // Add 3D buildings layer
        const layers = map.current!.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
        )?.id;

        // Add 3D buildings
        map.current!.addLayer(
          {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );

        // Add atmospheric lighting for better 3D effect
        map.current!.setLight({
          'anchor': 'viewport',
          'color': 'white',
          'intensity': 0.4
        });

        console.log('✅ 3D terrain and buildings added successfully');
      });

      console.log('✅ Map initialization complete with 3D features');

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
