
import mapboxgl from 'mapbox-gl';

export abstract class BaseMarkerManager {
  protected markers: mapboxgl.Marker[] = [];

  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  cleanup(): void {
    this.clearMarkers();
  }

  protected addMarker(marker: mapboxgl.Marker): void {
    this.markers.push(marker);
  }

  getMarkerCount(): number {
    return this.markers.length;
  }
}
