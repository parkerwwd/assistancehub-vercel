
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from './MapControls';

export interface MapInitOptions {
  container: HTMLDivElement;
  mapboxToken: string;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
}

export class MapInitializer {
  static createMap(options: MapInitOptions): mapboxgl.Map | null {
    const { container, mapboxToken, onTokenError, onBoundsChange } = options;
    
    if (!mapboxToken) {
      onTokenError("Mapbox token is required");
      return null;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Check if mobile
      const isMobile = window.innerWidth < 768;
      
      const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-95.7129, 37.0902], // Center of US
        zoom: 4,
        attributionControl: false,
        // Mobile-specific optimizations
        ...(isMobile && {
          maxZoom: 16, // Limit max zoom on mobile
          pitchWithRotate: false, // Disable 3D rotation on mobile
          touchPitch: false, // Disable pitch with touch
          dragRotate: false, // Disable rotation on mobile
          preserveDrawingBuffer: false, // Better performance
          refreshExpiredTiles: false, // Reduce network requests
          fadeDuration: 100, // Faster tile fading
        })
      });

      // Add attribution control in a better position
      map.addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: ''
      }), 'bottom-right');

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl({
        showCompass: !isMobile, // Hide compass on mobile
        visualizePitch: !isMobile // Hide pitch indicator on mobile
      }), 'top-right');

      // Add full screen control (desktop only)
      if (!isMobile) {
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      }

      // Set bounds change handler if provided
      if (onBoundsChange) {
        let boundsTimeout: NodeJS.Timeout;
        
        const debouncedBoundsChange = () => {
          clearTimeout(boundsTimeout);
          // Shorter debounce on mobile
          const delay = isMobile ? 100 : 200;
          boundsTimeout = setTimeout(() => {
            const bounds = map.getBounds();
            onBoundsChange(bounds);
          }, delay);
        };
        
        map.on('moveend', debouncedBoundsChange);
      }

      // Error handling
      map.on('error', (e) => {
        if (e.error?.message?.includes('Unauthorized')) {
          onTokenError("Invalid Mapbox token. Please check your token.");
        } else {
          console.error('Map error:', e);
        }
      });

      return map;
    } catch (error) {
      console.error('Error initializing map:', error);
      onTokenError("Failed to initialize map. Please check your Mapbox token.");
      return null;
    }
  }
}
