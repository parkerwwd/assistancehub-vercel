
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { MarkerUtils } from "../MarkerUtils";
import { BaseMarkerManager } from './BaseMarkerManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class AgencyMarkerManager extends BaseMarkerManager {
  addAllAgencyMarkers(map: mapboxgl.Map, agencies: PHAAgency[], onOfficeSelect: (office: PHAAgency) => void): void {
    if (!map || !agencies || agencies.length === 0) return;

    console.log('📍 Adding markers for', agencies.length, 'filtered agencies');

    // Clear existing agency markers
    this.clearMarkers();

    agencies.forEach(agency => {
      const lat = agency.latitude;
      const lng = agency.longitude;

      if (lat && lng) {
        try {
          const marker = MarkerUtils.createOfficeMarker(agency, onOfficeSelect);
          marker.addTo(map);
          this.addMarker(marker);
        } catch (error) {
          console.warn('⚠️ Failed to create marker for agency:', agency.name, error);
        }
      }
    });

    console.log('✅ Added', this.getMarkerCount(), 'agency markers to map');
  }

  // Public method to add a single marker
  addSingleMarker(marker: mapboxgl.Marker): void {
    this.addMarker(marker);
  }
  
  // Override to add logging
  getMarkerCount(): number {
    const count = super.getMarkerCount();
    console.log(`📊 AgencyMarkerManager.getMarkerCount() = ${count}`);
    return count;
  }
}
