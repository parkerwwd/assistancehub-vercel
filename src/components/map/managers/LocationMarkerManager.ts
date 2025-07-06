
import mapboxgl from 'mapbox-gl';
import { LocationMarker } from "../LocationMarker";
import { MarkerUtils } from "../MarkerUtils";
import { BaseMarkerManager } from './BaseMarkerManager';

export class LocationMarkerManager extends BaseMarkerManager {
  private locationMarker: mapboxgl.Marker | null = null;
  private locationMarkerHelper = new LocationMarker();

  setLocationMarker(
    map: mapboxgl.Map, 
    lat: number, 
    lng: number, 
    name: string, 
    mapboxToken: string, 
    showHoverCard: boolean = true
  ): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
    }
    
    console.log('📍 Setting location marker at coordinates:', { lat, lng, name });
    
    this.locationMarker = this.locationMarkerHelper.create({ 
      lat, 
      lng, 
      name, 
      mapboxToken,
      showHoverCard,
      color: 'red'
    });
    this.locationMarker
      .setPopup(MarkerUtils.createLocationPopup(name))
      .addTo(map);
      
    console.log('✅ Added enhanced location marker for:', name, 'at', { lat, lng }, 'showHoverCard:', showHoverCard);
  }

  clearLocationMarker(): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
      this.locationMarker = null;
    }
  }

  cleanup(): void {
    this.clearLocationMarker();
    super.cleanup();
  }
}
