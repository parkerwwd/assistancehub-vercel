
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { geocodePHAAddress } from "@/services/geocodingService";
import { LocationMarker } from "../LocationMarker";
import { BaseMarkerManager } from './BaseMarkerManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class OfficeLocationMarkerManager extends BaseMarkerManager {
  private locationMarkerHelper = new LocationMarker();

  async addOfficeLocationMarkers(map: mapboxgl.Map, offices: PHAAgency[], mapboxToken: string): Promise<void> {
    if (!map || !mapboxToken || !offices || offices.length === 0) return;
    
    console.log('📍 Adding office location markers for', offices.length, 'offices');
    
    // Clear existing office location markers
    this.clearMarkers();
    
    for (const office of offices) {
      if (!office.address) {
        console.warn('⚠️ No address for office:', office.name);
        continue;
      }
      
      try {
        console.log('🗺️ Geocoding office address:', office.address);
        
        // Use the improved geocoding service
        const coordinates = await geocodePHAAddress(office.address, mapboxToken);
        
        if (coordinates) {
          const { lat, lng } = coordinates;
          
          // Create blue location marker for office
          const officeLocationMarker = this.locationMarkerHelper.create({
            lat,
            lng,
            name: office.name,
            mapboxToken,
            showHoverCard: true,
            color: 'blue'
          });
          
          officeLocationMarker
            .setPopup(this.createOfficeLocationPopup(office))
            .addTo(map);
          
          this.addMarker(officeLocationMarker);
          
          console.log('✅ Added office location marker for:', office.name, 'at', { lat, lng });
        } else {
          console.warn('⚠️ Failed to geocode office address:', office.name, office.address);
        }
      } catch (error) {
        console.error('❌ Error geocoding office address:', office.name, error);
      }
    }
    
    console.log('✅ Added', this.getMarkerCount(), 'office location markers');
  }

  private createOfficeLocationPopup(office: PHAAgency): mapboxgl.Popup {
    return new mapboxgl.Popup({ 
      offset: [0, -40],
      closeButton: true,
      className: 'office-location-popup'
    }).setHTML(`
      <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">🏢 ${office.name}</div>
        ${office.address ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">📍 ${office.address}</div>` : ''}
        ${office.phone ? `<div style="font-size: 12px; color: #6b7280;">📞 ${office.phone}</div>` : ''}
      </div>
    `);
  }
}
