
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { getWaitlistColor } from "@/utils/mapUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MarkerUtils {
  static createOfficeMarker(office: PHAAgency, onOfficeSelect: (office: PHAAgency) => void): mapboxgl.Marker {
    const lat = office.latitude;
    const lng = office.longitude;
    
    // Comprehensive coordinate validation
    if (!lat || !lng || 
        typeof lat !== 'number' || typeof lng !== 'number' ||
        isNaN(lat) || isNaN(lng) || 
        !isFinite(lat) || !isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error(`❌ MarkerUtils: Invalid coordinates for office: ${office.name}`, {
        id: office.id,
        name: office.name,
        lat, lng,
        latType: typeof lat,
        lngType: typeof lng,
        isLatNaN: isNaN(lat),
        isLngNaN: isNaN(lng),
        isLatFinite: isFinite(lat),
        isLngFinite: isFinite(lng)
      });
      throw new Error(`Invalid coordinates for office: ${office.name}`);
    }

    const marker = new mapboxgl.Marker({
      color: '#ef4444', // Red color for properties
      scale: 1.0
    }).setLngLat([lng, lat]);

    // Add click handler with event prevention
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
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
