import mapboxgl from 'mapbox-gl';
import { PHAAgency } from "@/types/phaOffice";

export class MarkerUtils {
  static createPopup(office: PHAAgency): mapboxgl.Popup {
    return new mapboxgl.Popup({ closeButton: false })
      .setHTML(`<h3>${office.name}</h3><p>${office.address}</p>`);
  }

  static addMarker(map: mapboxgl.Map, lng: number, lat: number, color: string): mapboxgl.Marker {
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-marker';
    markerEl.style.background = color;
    markerEl.style.width = '10px';
    markerEl.style.height = '10px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.border = '2px solid white';
    markerEl.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
    return new mapboxgl.Marker(markerEl)
      .setLngLat([lng, lat])
      .addTo(map);
  }
}
