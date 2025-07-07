
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { AgencyMarkerManager } from './managers/AgencyMarkerManager';
import { LocationMarkerManager } from './managers/LocationMarkerManager';
import { OfficeMarkerManager } from './managers/OfficeMarkerManager';
import { ClusterManager } from './managers/ClusterManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MapMarkerManager {
  private agencyManager: AgencyMarkerManager;
  private locationManager: LocationMarkerManager;
  private officeManager: OfficeMarkerManager;
  private clusterManager: ClusterManager;
  private lastMapBounds: mapboxgl.LngLatBounds | null = null;
  private moveEndHandler: (() => void) | null = null;
  private zoomEndHandler: (() => void) | null = null;

  constructor() {
    this.agencyManager = new AgencyMarkerManager();
    this.locationManager = new LocationMarkerManager();
    this.officeManager = new OfficeMarkerManager();
    this.clusterManager = new ClusterManager();
  }

  // Handle location search flow: show found agencies OR just the location if no agencies found
  handleLocationSearch(
    map: mapboxgl.Map, 
    agencies: PHAAgency[], 
    selectedLocation: { lat: number; lng: number; name: string } | null,
    mapboxToken: string,
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
    if (!map || !mapboxToken) return;

    // Clear all markers first
    this.clearAllAgencyMarkers();
    this.clearLocationMarker();

    // If we have agencies, display them with clustering
    if (agencies && agencies.length > 0) {
      console.log('🏢 Displaying', agencies.length, 'PHAs with clustering');
      this.updateClusters(map, agencies, onOfficeSelect);
      return;
    }

    // If no agencies but we have a location, show the location marker
    if (selectedLocation) {
      console.log('📍 No PHAs found, showing location marker for:', selectedLocation.name);
      this.setLocationMarker(map, selectedLocation.lat, selectedLocation.lng, selectedLocation.name, mapboxToken);
    }
  }

  // Update clusters when map moves or zoom changes
  updateClusters(map: mapboxgl.Map, agencies: PHAAgency[], onOfficeSelect: (office: PHAAgency) => void): void {
    // Check if map bounds have changed significantly
    const currentBounds = map.getBounds();
    
    // Always update clusters when called
    this.clusterManager.updateClusters(map, agencies, onOfficeSelect);
    this.lastMapBounds = currentBounds;

    // Remove existing handlers if any
    if (this.moveEndHandler) {
      map.off('moveend', this.moveEndHandler);
    }
    if (this.zoomEndHandler) {
      map.off('zoomend', this.zoomEndHandler);
    }

    // Listen for map movement to update clusters
    this.moveEndHandler = () => {
      const bounds = map.getBounds();
      if (this.hasMapMovedSignificantly(bounds)) {
        this.clusterManager.updateClusters(map, agencies, onOfficeSelect);
        this.lastMapBounds = bounds;
      }
    };
    map.on('moveend', this.moveEndHandler);

    // Listen for zoom changes to update clusters
    this.zoomEndHandler = () => {
      this.clusterManager.updateClusters(map, agencies, onOfficeSelect);
    };
    map.on('zoomend', this.zoomEndHandler);
  }

  private hasMapMovedSignificantly(newBounds: mapboxgl.LngLatBounds): boolean {
    if (!this.lastMapBounds) return true;

    const threshold = 0.01; // Roughly 1km at mid latitudes
    
    return Math.abs(newBounds.getNorth() - this.lastMapBounds.getNorth()) > threshold ||
           Math.abs(newBounds.getSouth() - this.lastMapBounds.getSouth()) > threshold ||
           Math.abs(newBounds.getEast() - this.lastMapBounds.getEast()) > threshold ||
           Math.abs(newBounds.getWest() - this.lastMapBounds.getWest()) > threshold;
  }

  // Add selected office marker (without clustering)
  async addSelectedOfficeMarker(
    map: mapboxgl.Map, 
    office: PHAAgency, 
    mapboxToken: string, 
    onOfficeSelect: (office: PHAAgency) => void
  ): Promise<void> {
    await this.officeManager.addSelectedOfficeMarker(map, office, mapboxToken, onOfficeSelect);
  }

  // Clear all agency markers (including clusters)
  clearAllAgencyMarkers(): void {
    this.agencyManager.clearMarkers();
    this.clusterManager.clearMarkers();
  }

  // Clear location marker
  clearLocationMarker(): void {
    this.locationManager.clearLocationMarker();
  }

  // Clear office markers
  clearOfficeMarkers(): void {
    this.officeManager.clearMarkers();
  }

  // Set location marker
  setLocationMarker(
    map: mapboxgl.Map, 
    lat: number, 
    lng: number, 
    name: string, 
    mapboxToken: string,
    showHoverCard: boolean = true
  ): void {
    this.locationManager.clearLocationMarker();
    this.locationManager.setLocationMarker(
      map, 
      lat,
      lng,
      name,
      mapboxToken,
      showHoverCard
    );
  }

  // Reset to overview style
  resetToOverviewStyle(map: mapboxgl.Map): void {
    this.officeManager.resetToOverviewStyle(map);
  }

  // Cleanup all markers
  cleanup(): void {
    this.agencyManager.cleanup();
    this.locationManager.cleanup();
    this.officeManager.cleanup();
    this.clusterManager.clearMarkers();
    
    // Remove event handlers
    if (this.moveEndHandler) {
      this.moveEndHandler = null;
    }
    if (this.zoomEndHandler) {
      this.zoomEndHandler = null;
    }
  }
}
