
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { OfficeMarkerManager } from './managers/OfficeMarkerManager';
import { LocationMarkerManager } from './managers/LocationMarkerManager';
import { AgencyMarkerManager } from './managers/AgencyMarkerManager';
import { OfficeLocationMarkerManager } from './managers/OfficeLocationMarkerManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MapMarkerManager {
  private officeManager = new OfficeMarkerManager();
  private locationManager = new LocationMarkerManager();
  private agencyManager = new AgencyMarkerManager();
  private officeLocationManager = new OfficeLocationMarkerManager();

  // Office marker methods
  clearOfficeMarkers(): void {
    this.officeManager.clearMarkers();
  }

  async addSelectedOfficeMarker(
    map: mapboxgl.Map, 
    office: PHAAgency, 
    mapboxToken: string, 
    onOfficeSelect: (office: PHAAgency) => void
  ): Promise<void> {
    return this.officeManager.addSelectedOfficeMarker(map, office, mapboxToken, onOfficeSelect);
  }

  resetToOverviewStyle(map: mapboxgl.Map): void {
    this.officeManager.resetToOverviewStyle(map);
  }

  // Location marker methods
  setLocationMarker(
    map: mapboxgl.Map, 
    lat: number, 
    lng: number, 
    name: string, 
    mapboxToken: string, 
    showHoverCard: boolean = true
  ): void {
    this.locationManager.setLocationMarker(map, lat, lng, name, mapboxToken, showHoverCard);
  }

  clearLocationMarker(): void {
    this.locationManager.clearLocationMarker();
  }

  // Agency marker methods
  addAllAgencyMarkers(map: mapboxgl.Map, agencies: PHAAgency[], onOfficeSelect: (office: PHAAgency) => void): void {
    this.agencyManager.addAllAgencyMarkers(map, agencies, onOfficeSelect);
  }

  clearAllAgencyMarkers(): void {
    this.agencyManager.clearMarkers();
  }

  // Office location marker methods
  async addOfficeLocationMarkers(map: mapboxgl.Map, offices: PHAAgency[], mapboxToken: string): Promise<void> {
    return this.officeLocationManager.addOfficeLocationMarkers(map, offices, mapboxToken);
  }

  clearOfficeLocationMarkers(): void {
    this.officeLocationManager.clearMarkers();
  }

  // Combined methods for complex operations
  handleLocationSearch(
    map: mapboxgl.Map, 
    agencies: PHAAgency[], 
    selectedLocation: { lat: number; lng: number; name: string } | null,
    mapboxToken: string,
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
    if (!map) return;

    console.log('🔍 Handling location search:', {
      agenciesFound: agencies.length,
      hasSelectedLocation: !!selectedLocation
    });

    // Clear existing markers
    this.clearAllAgencyMarkers();
    this.clearLocationMarker();
    this.clearOfficeLocationMarkers();

    if (agencies.length > 0) {
      // Found agencies - show markers for all found agencies AND add office location markers
      console.log('✅ Found', agencies.length, 'agencies, showing agency markers and office location markers');
      this.addAllAgencyMarkers(map, agencies, onOfficeSelect);
      this.addOfficeLocationMarkers(map, agencies, mapboxToken);
    } else if (selectedLocation) {
      // No agencies found - show only the selected location marker
      console.log('📍 No agencies found, showing only location marker for:', selectedLocation.name);
      this.setLocationMarker(map, selectedLocation.lat, selectedLocation.lng, selectedLocation.name, mapboxToken);
    }
  }

  cleanup(): void {
    this.officeManager.cleanup();
    this.locationManager.cleanup();
    this.agencyManager.cleanup();
    this.officeLocationManager.cleanup();
  }
}
