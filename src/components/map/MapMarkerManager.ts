
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";
import { LocationMarker } from "./LocationMarker";
import { MarkerUtils } from "./MarkerUtils";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export class MapMarkerManager {
  private officeMarkers: mapboxgl.Marker[] = [];
  private allAgencyMarkers: mapboxgl.Marker[] = [];
  private locationMarker: mapboxgl.Marker | null = null;
  private locationMarkerHelper = new LocationMarker();

  clearOfficeMarkers(): void {
    this.officeMarkers.forEach(marker => marker.remove());
    this.officeMarkers = [];
  }

  clearAllAgencyMarkers(): void {
    this.allAgencyMarkers.forEach(marker => marker.remove());
    this.allAgencyMarkers = [];
  }

  clearLocationMarker(): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
      this.locationMarker = null;
    }
  }

  setLocationMarker(map: mapboxgl.Map, lat: number, lng: number, name: string, mapboxToken: string): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
    }
    
    this.locationMarker = this.locationMarkerHelper.create({ 
      lat, 
      lng, 
      name, 
      mapboxToken 
    });
    this.locationMarker
      .setPopup(MarkerUtils.createLocationPopup(name))
      .addTo(map);
      
    console.log('📍 Added enhanced location marker with correct satellite image for:', name, 'at', { lat, lng });
  }

  async addSelectedOfficeMarker(map: mapboxgl.Map, office: PHAAgency, mapboxToken: string, onOfficeSelect: (office: PHAAgency) => void): Promise<void> {
    if (!map || !mapboxToken) return;
    
    console.log('📍 Adding marker for selected office:', office.name);
    
    // Use geocoded coordinates since latitude/longitude fields don't exist
    let lat = (office as any).geocoded_latitude;
    let lng = (office as any).geocoded_longitude;
    
    // If no coordinates, try to geocode the address
    if ((!lat || !lng) && office.address) {
      console.log('🗺️ No coordinates found, trying to geocode address:', office.address);
      
      try {
        const fullAddress = office.address;
        const encodedAddress = encodeURIComponent(fullAddress);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const [geocodedLng, geocodedLat] = data.features[0].center;
            lat = geocodedLat;
            lng = geocodedLng;
            console.log('✅ Geocoded coordinates:', { lat, lng });
          }
        }
      } catch (error) {
        console.warn('⚠️ Geocoding error:', error);
      }
    }
    
    if (lat && lng) {
      try {
        // Switch to satellite style for office detail view
        if (map.getStyle().name !== 'Mapbox Satellite Streets') {
          map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        }

        // Fly to office with close zoom level
        map.flyTo({
          center: [lng, lat],
          zoom: 18,
          pitch: 0,
          bearing: 0,
          duration: 2500,
          essential: true
        });

        const marker = new mapboxgl.Marker({
          color: '#ef4444',
          scale: 1.5
        })
        .setLngLat([lng, lat])
        .setPopup(this.createOfficePopup(office));
        
        marker.getElement().addEventListener('click', () => {
          console.log('🎯 3D Marker clicked:', office.name);
          onOfficeSelect(office);
        });
        
        this.styleMarkerElement(marker.getElement());
        
        marker.addTo(map);
        this.officeMarkers.push(marker);
        
        console.log('✅ Added 3D marker for selected office:', office.name, 'at', { lat, lng });
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
        <p style="margin: 0; font-size: 13px; color: #ef4444; font-weight: 600;">Status: Unknown</p>
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
    if (map && map.getStyle().name === 'Mapbox Satellite Streets') {
      map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
      map.flyTo({
        center: [-95.7129, 37.0902],
        zoom: 4,
        pitch: 45,
        bearing: 0,
        duration: 2000
      });
    }
  }

  /**
   * Add markers for all filtered agencies OR just the location marker if no agencies found
   */
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

    if (agencies.length > 0) {
      // Found agencies - show markers for all found agencies
      console.log('✅ Found', agencies.length, 'agencies, showing agency markers');
      this.addAllAgencyMarkers(map, agencies, onOfficeSelect);
    } else if (selectedLocation) {
      // No agencies found - show only the selected location marker
      console.log('📍 No agencies found, showing only location marker for:', selectedLocation.name);
      this.setLocationMarker(map, selectedLocation.lat, selectedLocation.lng, selectedLocation.name, mapboxToken);
    }
  }

  /**
   * Add markers for all filtered agencies
   */
  addAllAgencyMarkers(map: mapboxgl.Map, agencies: PHAAgency[], onOfficeSelect: (office: PHAAgency) => void): void {
    if (!map || !agencies || agencies.length === 0) return;

    console.log('📍 Adding markers for', agencies.length, 'filtered agencies');

    // Clear existing agency markers
    this.clearAllAgencyMarkers();

    agencies.forEach(agency => {
      const lat = (agency as any).geocoded_latitude;
      const lng = (agency as any).geocoded_longitude;

      if (lat && lng) {
        try {
          const marker = MarkerUtils.createOfficeMarker(agency, onOfficeSelect);
          marker.addTo(map);
          this.allAgencyMarkers.push(marker);
        } catch (error) {
          console.warn('⚠️ Failed to create marker for agency:', agency.name, error);
        }
      }
    });

    console.log('✅ Added', this.allAgencyMarkers.length, 'agency markers to map');
  }

  cleanup(): void {
    this.clearOfficeMarkers();
    this.clearAllAgencyMarkers();
    this.clearLocationMarker();
  }
}
