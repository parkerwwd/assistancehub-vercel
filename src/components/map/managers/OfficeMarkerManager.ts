
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { geocodePHAAddress } from "@/services/geocodingService";
import { BaseMarkerManager } from './BaseMarkerManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class OfficeMarkerManager extends BaseMarkerManager {
  async addSelectedOfficeMarker(
    map: mapboxgl.Map, 
    office: PHAAgency, 
    mapboxToken: string, 
    onOfficeSelect: (office: PHAAgency) => void
  ): Promise<void> {
    if (!map || !mapboxToken) return;
    
    console.log('📍 Adding marker for selected office (no animation):', office.name);
    
    // Use database coordinates first
    let lat = office.latitude;
    let lng = office.longitude;
    
    // If no coordinates, try to geocode the address using improved service
    if ((!lat || !lng) && office.address) {
      console.log('🗺️ No coordinates found, geocoding address:', office.address);
      
      try {
        const coordinates = await geocodePHAAddress(office.address, mapboxToken);
        
        if (coordinates) {
          lat = coordinates.lat;
          lng = coordinates.lng;
          console.log('✅ Geocoded coordinates for office:', office.name, { lat, lng });
        }
      } catch (error) {
        console.error('❌ Failed to geocode office address:', office.name, error);
      }
    }
    
    if (lat && lng) {
      try {
        // DON'T change map style or fly to location - just add the marker
        // This prevents the bouncing effect when users click pins
        
        const marker = new mapboxgl.Marker({
          color: '#ef4444',
          scale: 1.2 // Slightly larger but not too dramatic
        })
        .setLngLat([lng, lat])
        .setPopup(this.createOfficePopup(office));
        
        // Don't add another click handler - this prevents double-clicking issues
        
        this.styleMarkerElement(marker.getElement());
        
        marker.addTo(map);
        this.addMarker(marker);
        
        console.log('✅ Added selected office marker (no animation):', office.name, 'at', { lat, lng });
      } catch (error) {
        console.warn('⚠️ Failed to add marker for office:', office.name, error);
      }
    } else {
      console.warn('⚠️ No coordinates available for office:', office.name);
    }
  }

  private createOfficePopup(office: PHAAgency): mapboxgl.Popup {
    return new mapboxgl.Popup({ 
      offset: 25,
      className: 'map-popup-3d'
    })
    .setHTML(`
      <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1f2937; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">🏢 ${office.name}</h3>
        ${office.address ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">📍 ${office.address}</p>` : ''}
        ${office.phone ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">📞 ${office.phone}</p>` : ''}
        <p style="margin: 0; font-size: 13px; color: #ef4444; font-weight: 600;">Status: Active</p>
      </div>
    `);
  }

  private styleMarkerElement(element: HTMLElement): void {
    element.style.cursor = 'pointer';
    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    element.style.transform = 'scale(1.5)';
    element.style.filter = 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2))';

    element.addEventListener('mouseenter', () => {
      element.style.filter = 'drop-shadow(0 8px 16px rgba(239, 68, 68, 0.4)) brightness(1.1) saturate(1.2)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.filter = 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2))';
    });
  }

  resetToOverviewStyle(map: mapboxgl.Map): void {
    // Don't automatically fly to overview when deselecting office
    // This prevents unwanted animation when users just want to close the office details
    console.log('🔄 Resetting to overview style (no animation)');
    
    // Just clear markers without changing map position
    this.clearMarkers();
  }
}
