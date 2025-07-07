
import mapboxgl from 'mapbox-gl';

export class Map3DControls {
  static addControls(map: mapboxgl.Map): void {
    // Add navigation controls for 2D map
    map.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  }

  static setup3DFeatures(map: mapboxgl.Map): void {
    // No 3D features needed for 2D map
    // This method is kept for compatibility but does nothing
    console.log('🗺️ Using 2D map view');
  }
}
