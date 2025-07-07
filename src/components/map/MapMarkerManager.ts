
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

    // If we have agencies, display them WITHOUT clustering (show all pins)
    if (agencies && agencies.length > 0) {
      console.log('🏢 Displaying', agencies.length, 'PHAs as individual pins');
      this.displayAllPHAsAsIndividualPins(map, agencies, onOfficeSelect);
      return;
    }

    // If no agencies but we have a location, show the location marker
    if (selectedLocation) {
      console.log('📍 No PHAs found, showing location marker for:', selectedLocation.name);
      this.setLocationMarker(map, selectedLocation.lat, selectedLocation.lng, selectedLocation.name, mapboxToken);
    }
  }

  // New method to display all PHAs as individual pins without clustering
  displayAllPHAsAsIndividualPins(
    map: mapboxgl.Map, 
    agencies: PHAAgency[], 
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
    // Clear all markers first
    this.clearAllAgencyMarkers();
    
    console.log(`📍 Displaying ${agencies.length} PHAs as individual pins`);
    
    let successCount = 0;
    let skipCount = 0;
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;
    
    agencies.forEach(agency => {
      // Check database coordinates first, then geocoded ones
      const lat = agency.latitude || (agency as any).geocoded_latitude;
      const lng = agency.longitude || (agency as any).geocoded_longitude;
      
      if (!lat || !lng) {
        console.warn(`⚠️ No coordinates for PHA: ${agency.name} (${agency.city}, ${agency.state})`, {
          name: agency.name,
          address: agency.address,
          city: agency.city,
          state: agency.state,
          hasDbCoords: !!(agency.latitude && agency.longitude),
          hasGeocodedCoords: !!((agency as any).geocoded_latitude && (agency as any).geocoded_longitude)
        });
        skipCount++;
        return;
      }
      
      try {
        // Add to bounds
        bounds.extend([lng, lat]);
        hasValidCoordinates = true;
        
        // Determine marker color based on program type
        let markerColor = '#10b981'; // Default green
        const programType = agency.program_type?.toLowerCase() || '';
        
        if (programType.includes('section 8')) {
          markerColor = '#3b82f6'; // Blue for Section 8
        } else if (programType.includes('combined')) {
          markerColor = '#a855f7'; // Purple for Combined
        } else if (programType.includes('low-rent')) {
          markerColor = '#10b981'; // Green for Low-Rent
        }
        
        // Create marker with custom styling
        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 0.8 // Slightly smaller for many pins
        })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 12px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${agency.name}</h3>
                ${agency.address ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${agency.address}</p>` : ''}
                ${agency.phone ? `<p style="margin: 0; font-size: 14px; color: #6b7280;">📞 ${agency.phone}</p>` : ''}
                ${agency.program_type ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: ${markerColor}; font-weight: 500;">🏢 ${agency.program_type}</p>` : ''}
                <button 
                  onclick="window.postMessage({ type: 'selectOffice', officeId: '${agency.id}' }, '*')"
                  style="margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
                >
                  View Details
                </button>
              </div>
            `)
        );

        // Add click handler
        marker.getElement().addEventListener('click', () => {
          onOfficeSelect(agency);
        });

        // Enhanced styling for the marker element
        const element = marker.getElement();
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.2s ease';
        
        element.addEventListener('mouseenter', () => {
          element.style.transform = 'scale(1.2)';
          element.style.zIndex = '1000';
        });
        element.addEventListener('mouseleave', () => {
          element.style.transform = 'scale(1)';
          element.style.zIndex = 'auto';
        });

        marker.addTo(map);
        this.agencyManager.addSingleMarker(marker);
        successCount++;
      } catch (error) {
        console.error(`Failed to create marker for ${agency.name}:`, error);
        skipCount++;
      }
    });
    
    console.log(`✅ Successfully displayed ${successCount} PHAs as individual pins`);
    console.log(`❌ Skipped ${skipCount} PHAs due to missing coordinates or errors`);
    
    // Adjust map bounds to show all pins if we have any valid coordinates
    if (hasValidCoordinates && successCount > 0) {
      try {
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12, // Don't zoom in too close
          duration: 800 // Smooth animation
        });
        console.log('📍 Adjusted map bounds to show all PHAs with coordinates');
      } catch (error) {
        console.error('Failed to adjust map bounds:', error);
      }
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
