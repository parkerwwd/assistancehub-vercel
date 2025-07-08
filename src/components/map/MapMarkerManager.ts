
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { AgencyMarkerManager } from './managers/AgencyMarkerManager';
import { LocationMarkerManager } from './managers/LocationMarkerManager';
import { OfficeMarkerManager } from './managers/OfficeMarkerManager';
import { ClusterManager } from './managers/ClusterManager';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MapMarkerManager {
  private clusterManager: ClusterManager = new ClusterManager();
  private officeManager: OfficeMarkerManager = new OfficeMarkerManager();
  private agencyManager: AgencyMarkerManager = new AgencyMarkerManager();
  private locationManager: LocationMarkerManager = new LocationMarkerManager();
  private lastMapBounds: mapboxgl.LngLatBounds | null = null;
  private moveEndHandler: (() => void) | null = null;
  private zoomEndHandler: (() => void) | null = null;
  private selectedOfficeId: string | null = null;
  private selectedMarker: mapboxgl.Marker | null = null;

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
    try {
      // Clear all markers first
      this.clearAllAgencyMarkers();
      
      console.log(`📍 displayAllPHAsAsIndividualPins called with ${agencies.length} PHAs`);
      
      // Verify map is ready
      if (!map || !map.loaded()) {
        console.error('❌ Map is not loaded in displayAllPHAsAsIndividualPins');
        return;
      }
    
    // Log details about the first few agencies to debug
    if (agencies.length > 0) {
      console.log('🔍 First 3 PHAs to display:', agencies.slice(0, 3).map(agency => ({
        name: agency.name,
        city: agency.city,
        state: agency.state,
        hasDBCoords: !!(agency.latitude && agency.longitude),
        dbLat: agency.latitude,
        dbLng: agency.longitude,
        address: agency.address
      })));
    }
    
    let successCount = 0;
    let skipCount = 0;
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;
    const missingCoordinates: PHAAgency[] = [];
    
    agencies.forEach(agency => {
      const lat = agency.latitude;
      const lng = agency.longitude;
      
      // Skip agencies without coordinates
      if (!lat || !lng) {
        console.log(`⚠️ Skipping ${agency.name} - no coordinates`);
        return; // Use return instead of continue in forEach
      }
      
      // Validate coordinates are reasonable
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        console.error(`❌ Invalid coordinates for ${agency.name}: lat=${lat}, lng=${lng}`);
        return; // Use return instead of continue in forEach
      }
      
      console.log(`📍 Creating marker ${successCount + 1} for ${agency.name} at [lng: ${lng}, lat: ${lat}]`);
      
      try {
        // Add to bounds
        bounds.extend([lng, lat]);
        hasValidCoordinates = true;
        
        // Determine marker color based on program type
        let markerColor = '#10b981'; // Default green
        const programType = agency.program_type?.toLowerCase() || '';
        
        if (programType.includes('section 8') || programType.includes('hcv')) {
          markerColor = '#3b82f6'; // Blue for Section 8/HCV
        } else if (programType.includes('combined')) {
          markerColor = '#a855f7'; // Purple for Combined
        } else if (programType.includes('low-rent') || programType.includes('public housing')) {
          markerColor = '#10b981'; // Green for Low-Rent/Public Housing
        } else if (programType.includes('mod rehab')) {
          markerColor = '#f59e0b'; // Orange for Mod Rehab
        }
        
        // Extra validation before creating marker
        if (typeof lat !== 'number' || typeof lng !== 'number' || 
            isNaN(lat) || isNaN(lng) || 
            !isFinite(lat) || !isFinite(lng)) {
          console.error('❌ Invalid coordinates detected before marker creation:', {
            agency: agency.name,
            lat: lat,
            lng: lng,
            latType: typeof lat,
            lngType: typeof lng,
            isLatNaN: isNaN(lat),
            isLngNaN: isNaN(lng),
            isLatFinite: isFinite(lat),
            isLngFinite: isFinite(lng)
          });
          skipCount++;
          return;
        }

        // Create marker with custom styling
        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 0.8 // Slightly smaller for many pins
        })
        .setLngLat([lng, lat])
        // Add simple popup with just the name as a tooltip
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false,
            closeOnClick: false,
            className: 'pha-popup-tooltip'
          })
            .setHTML(`
              <div style="padding: 8px 12px; font-weight: 600; font-size: 14px;">
                ${agency.name}
              </div>
            `)
        )
        .addTo(map); // ADD THIS LINE - This was missing!
        
        console.log(`✅ Marker ${successCount + 1} added to map for:`, agency.name, 'at', [lng, lat]);

        // Get marker element with null check
        const element = marker.getElement();
        if (!element) {
          console.error(`❌ Marker element is null for ${agency.name}`);
          skipCount++;
          return;
        }

        // Add click handler with event prevention
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('🎯 Individual pin clicked:', agency.name, 'Color:', markerColor, 'Program Type:', agency.program_type);
          console.log('🔍 Purple pin debug - Agency data:', {
            id: agency.id,
            name: agency.name,
            program_type: agency.program_type,
            address: agency.address,
            phone: agency.phone,
            email: agency.email,
            isPurple: markerColor === '#a855f7'
          });
          
          // Reset previous selected marker
          if (this.selectedMarker && this.selectedMarker !== marker) {
            const prevElement = this.selectedMarker.getElement();
            prevElement.style.transform = 'scale(1)';
            prevElement.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
          }
          
          // Mark this pin as selected with visual feedback
          this.selectedOfficeId = agency.id;
          this.selectedMarker = marker;
          const element = marker.getElement();
          element.style.transform = 'scale(1.2)';
          element.style.filter = 'brightness(1.3) saturate(1.5) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))';
          element.style.zIndex = '2000';
          
          onOfficeSelect(agency);
        });

        // Enhanced styling for the marker element
        element.style.cursor = 'pointer';
        element.style.transition = 'filter 0.2s ease, box-shadow 0.2s ease';
        element.title = agency.name; // Add tooltip
        
        element.addEventListener('mouseenter', () => {
          // Use filter effects instead of transform to avoid movement
          element.style.filter = 'brightness(1.2) saturate(1.3) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
          element.style.zIndex = '1000';
        });
        element.addEventListener('mouseleave', () => {
          // Reset filter effects
          element.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
          element.style.zIndex = 'auto';
        });

        // Store marker in agency manager
        this.agencyManager.addSingleMarker(marker);
        successCount++;
        console.log(`💾 Stored marker ${successCount} in agencyManager`);
      } catch (error) {
        console.error(`❌ Failed to create marker for ${agency.name}:`, error);
        skipCount++;
      }
    });
    
    console.log(`✅ Successfully created and displayed ${successCount} agency markers`);
    console.log(`⚠️ Skipped ${skipCount} agencies (missing or invalid coordinates)`);
    console.log(`📊 AgencyManager now has ${this.agencyManager.getMarkerCount()} markers stored`);
    
    // Provide detailed feedback about missing coordinates
    if (missingCoordinates.length > 0) {
      console.log(`📍 ${missingCoordinates.length} PHAs missing coordinates:`, {
        totalPHAs: agencies.length,
        withCoordinates: successCount,
        missingCoordinates: missingCoordinates.length,
        missingAddresses: missingCoordinates.filter(pha => !pha.address).length
      });
      
      // Log a sample of PHAs that need geocoding
      console.log('📍 Sample PHAs needing geocoding:');
      missingCoordinates.slice(0, 5).forEach(pha => {
        console.log(`   - ${pha.name} | ${pha.address || 'No address'} | ${pha.city}, ${pha.state}`);
      });
      
      if (missingCoordinates.length > 5) {
        console.log(`   ... and ${missingCoordinates.length - 5} more`);
      }
    }
    
    // Don't adjust bounds when showing all PHAs - keep the current view
    // This lets users see the full distribution of PHAs across the country
    console.log(`🗺️ Showing ${successCount} PHAs across the map`);
  } catch (error) {
    console.error('❌ Error in displayAllPHAsAsIndividualPins:', error);
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

  // Clear visual selection state
  clearSelection(): void {
    if (this.selectedMarker) {
      const element = this.selectedMarker.getElement();
      element.style.transform = 'scale(1)';
      element.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
      element.style.zIndex = 'auto';
    }
    this.selectedOfficeId = null;
    this.selectedMarker = null;
  }

  // No visual selection needed - just let the PHA information panel handle the selection state
  selectExistingPin(office: PHAAgency): void {
    console.log('📌 Pin clicked - visual feedback applied, showing PHA info for:', office.name);
  }
  
  // No need to deselect pins since we don't change their appearance
  deselectAllPins(): void {
    console.log('📌 Selection cleared - no visual changes needed to pins');
    // Don't change pin appearance - let the information panel handle the state
  }

  // Simplified - no marker changes needed
  async addSelectedOfficeMarker(
    map: mapboxgl.Map, 
    office: PHAAgency, 
    mapboxToken: string, 
    onOfficeSelect: (office: PHAAgency) => void
  ): Promise<void> {
    // No visual changes to pins - just track selection for info panel
    console.log('📌 Office selected - no visual pin changes');
  }

  // Clear all markers from all managers
  clearAllMarkers(): void {
    console.log('🧹 Clearing ALL markers from all managers');
    this.agencyManager.clearMarkers();
    this.locationManager.clearLocationMarker();
    this.officeManager.clearMarkers();
    this.clusterManager.clearMarkers();
    this.clearSelection();
  }

  // Clear only agency markers (not location marker)
  clearAllAgencyMarkers(): void {
    console.log('🧹 Clearing only agency markers (keeping location marker)');
    this.agencyManager.clearMarkers();
    this.officeManager.clearMarkers();
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
