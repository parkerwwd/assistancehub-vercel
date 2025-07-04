
import mapboxgl from 'mapbox-gl';
import { PHAAgency } from "@/types/phaOffice";

export class MarkerUtils {
  static createPopup(office: PHAAgency): mapboxgl.Popup {
    return new mapboxgl.Popup({ closeButton: false })
      .setHTML(`<h3>${office.name}</h3><p>${office.address}</p>`);
  }

  static createLocationPopup(name: string): mapboxgl.Popup {
    return new mapboxgl.Popup({ 
      closeButton: false,
      className: 'location-popup'
    })
    .setHTML(`
      <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">📍 ${name}</h3>
      </div>
    `);
  }

  static createOfficeMarker(office: PHAAgency, onOfficeSelect: (office: PHAAgency) => void): mapboxgl.Marker {
    const lat = (office as any).geocoded_latitude;
    const lng = (office as any).geocoded_longitude;

    if (!lat || !lng) {
      throw new Error(`No coordinates available for office: ${office.name}`);
    }

    const markerEl = document.createElement('div');
    markerEl.className = 'custom-office-marker';
    markerEl.style.background = '#3b82f6';
    markerEl.style.width = '12px';
    markerEl.style.height = '12px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.border = '2px solid white';
    markerEl.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
    markerEl.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker(markerEl)
      .setLngLat([lng, lat])
      .setPopup(this.createPopup(office));

    markerEl.addEventListener('click', () => {
      onOfficeSelect(office);
    });

    return marker;
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
