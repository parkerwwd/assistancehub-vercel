
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from './MapControls';

interface MapInitializerOptions {
  container: HTMLDivElement;
  mapboxToken: string;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
}

export class MapInitializer {
  static createMap({ container, mapboxToken, onTokenError, onBoundsChange }: MapInitializerOptions): mapboxgl.Map | null {
    console.log('🗺️ MapInitializer - Token:', mapboxToken ? `Present (${mapboxToken.substring(0, 20)}...)` : 'Missing');
    
    // Validate token
    if (!mapboxToken || !mapboxToken.trim() || !mapboxToken.startsWith('pk.')) {
      console.error('❌ Invalid or missing Mapbox token:', mapboxToken);
      onTokenError("Invalid Mapbox token. Please check your token configuration.");
      return null;
    }

    // Clear any previous error
    onTokenError("");

    try {
      console.log('🗺️ Setting Mapbox access token...');
      mapboxgl.accessToken = mapboxToken.trim();
      
      console.log('🗺️ Creating map instance...');
      
      // Create the map with 3D configuration
      const map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-95.7129, 37.0902],
        zoom: 4,
        pitch: 45,
        bearing: 0,
        antialias: true,
        maxPitch: 85
      });
      
      console.log('🗺️ Map instance created successfully');
      
      // Add error handling for the map
      map.on('error', (e) => {
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
      
      // Setup map events
      MapControls.setupMapEvents(map, onTokenError, onBoundsChange);
      
      return map;
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      onTokenError(`Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }
}
