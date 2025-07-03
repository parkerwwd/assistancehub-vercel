
import mapboxgl from 'mapbox-gl';

export class MapControls {
  static addNavigationControls(map: mapboxgl.Map): void {
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }

  static setupMapEvents(
    map: mapboxgl.Map, 
    onTokenError: (error: string) => void,
    onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void
  ): void {
    // Handle map load errors
    map.on('error', (e) => {
      console.error('Map error:', e);
      if (e.error && 'status' in e.error && e.error.status === 401) {
        onTokenError("Invalid Mapbox token. Please check your token and try again.");
      } else {
        onTokenError("Error loading map. Please check your token and try again.");
      }
    });

    // Setup map when it loads
    map.on('load', () => {
      console.log('🗺️ Map loaded successfully - showing full US view');
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      }
    });

    // Listen for bounds changes
    if (onBoundsChange) {
      const handleBoundsChange = () => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      };
      
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', handleBoundsChange);
    }
  }

  static createMap(container: HTMLDivElement, token: string): mapboxgl.Map {
    mapboxgl.accessToken = token.trim();
    
    return new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902], // Center on continental US
      zoom: 4,
      minZoom: 3,
      maxZoom: 18
    });
  }
}
