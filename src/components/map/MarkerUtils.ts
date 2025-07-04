
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MarkerUtils {
  static async createOfficeMarker(
    office: PHAAgency, 
    mapboxToken: string,
    onOfficeSelect: (office: PHAAgency) => void
  ): Promise<mapboxgl.Marker | null> {
    // Geocode the address since lat/lng columns were removed
    if (!office.address) {
      console.warn('No address available for office:', office.name);
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(office.address);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`
      );
      
      if (!response.ok) {
        console.warn('Geocoding failed for:', office.name);
        return null;
      }
      
      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        console.warn('No geocoding results for:', office.name);
        return null;
      }

      const [lng, lat] = data.features[0].center;

      const marker = new mapboxgl.Marker({
        color: '#3b82f6',
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
    } catch (error) {
      console.warn('Error creating marker for office:', office.name, error);
      return null;
    }
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
