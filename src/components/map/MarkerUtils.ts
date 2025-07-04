
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MarkerUtils {
  static createOfficeMarker(office: PHAAgency, onOfficeSelect: (office: PHAAgency) => void): mapboxgl.Marker {
    const lat = (office as any).geocoded_latitude;
    const lng = (office as any).geocoded_longitude;
    
    if (!lat || !lng) {
      throw new Error(`No coordinates for office: ${office.name}`);
    }

    const marker = new mapboxgl.Marker({
      color: getWaitlistColor('Unknown'), // Use default since waitlist_status doesn't exist
      scale: 1.0
    }).setLngLat([lng, lat]);

    // Add click handler
    marker.getElement().addEventListener('click', () => {
      console.log('🎯 Marker clicked:', office.name);
      onOfficeSelect(office);
    });

    // Add hover effects without moving the marker
    const element = marker.getElement();
    element.style.cursor = 'pointer';
    element.style.transition = 'filter 0.2s ease, box-shadow 0.2s ease';

    element.addEventListener('mouseenter', () => {
      element.style.filter = 'brightness(1.2) saturate(1.3)';
      element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.filter = 'brightness(1) saturate(1)';
      element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    return marker;
  }

  static createLocationPopup(name: string): mapboxgl.Popup {
    return new mapboxgl.Popup({ 
      offset: [0, -40],
      closeButton: true,
      className: 'location-popup'
    }).setHTML(`
      <div style="padding: 8px 12px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">📍 ${name}</div>
        <div style="font-size: 12px; color: #6b7280;">Selected Location</div>
      </div>
    `);
  }
}
