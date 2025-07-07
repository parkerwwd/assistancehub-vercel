import Supercluster from 'supercluster';
import mapboxgl from 'mapbox-gl';
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface AgencyProperties {
  agency: PHAAgency;
}

export class ClusterManager {
  private cluster: Supercluster<AgencyProperties>;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  
  constructor() {
    this.cluster = new Supercluster({
      radius: 40, // Reduced from 60 - cluster radius in pixels
      maxZoom: 16, // Increased from 14 - show individual pins at higher zoom levels
      minPoints: 4 // Increased from 2 - need at least 4 PHAs to form a cluster
    });
  }

  updateClusters(
    map: mapboxgl.Map,
    agencies: PHAAgency[],
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
    // Clear existing markers
    this.clearMarkers();

    // Log total agencies
    console.log(`📍 Processing ${agencies.length} PHAs for map display`);

    // Convert agencies to GeoJSON features
    const features: GeoJSON.Feature<GeoJSON.Point, AgencyProperties>[] = agencies
      .filter(agency => {
        // Check database coordinates first, then geocoded ones
        const lat = agency.latitude || (agency as any).geocoded_latitude;
        const lng = agency.longitude || (agency as any).geocoded_longitude;
        
        if (!lat || !lng) {
          console.warn(`⚠️ No coordinates for PHA: ${agency.name} (${agency.city}, ${agency.state})`);
        }
        
        return lat && lng;
      })
      .map(agency => ({
        type: 'Feature' as const,
        properties: { agency },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            agency.longitude || (agency as any).geocoded_longitude,
            agency.latitude || (agency as any).geocoded_latitude
          ]
        }
      }));

    console.log(`✅ ${features.length} PHAs have valid coordinates and will be displayed`);
    console.log(`❌ ${agencies.length - features.length} PHAs missing coordinates`);

    // Load features into cluster
    this.cluster.load(features);

    // Get current map bounds and zoom
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    // Get clusters
    const clusters = this.cluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      Math.floor(zoom)
    );

    // Create markers for each cluster/point
    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      const properties = cluster.properties;
      
      if ('cluster' in properties && properties.cluster) {
        // Create cluster marker - properties is ClusterProperties
        this.createClusterMarker(map, lng, lat, properties as Supercluster.ClusterProperties);
      } else {
        // Create individual marker - properties is AgencyProperties
        const agencyProps = properties as AgencyProperties;
        this.createAgencyMarker(map, lng, lat, agencyProps.agency, onOfficeSelect);
      }
    });
  }

  private createClusterMarker(
    map: mapboxgl.Map,
    lng: number,
    lat: number,
    properties: Supercluster.ClusterProperties
  ): void {
    const count = properties.point_count || 0;
    const clusterId = properties.cluster_id;
    
    // Create custom cluster element
    const el = document.createElement('div');
    el.className = 'cluster-marker';
    el.style.width = `${40 + (count / 10) * 10}px`;
    el.style.height = `${40 + (count / 10) * 10}px`;
    el.style.lineHeight = `${40 + (count / 10) * 10}px`;
    el.style.backgroundColor = '#3b82f6';
    el.style.color = 'white';
    el.style.borderRadius = '50%';
    el.style.textAlign = 'center';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '14px';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.2s ease';
    el.textContent = String(properties.point_count_abbreviated || count);

    // Add hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.backgroundColor = '#2563eb';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.backgroundColor = '#3b82f6';
    });

    // Add click handler to zoom into cluster
    el.addEventListener('click', () => {
      if (clusterId !== undefined) {
        const zoom = this.cluster.getClusterExpansionZoom(clusterId);
        map.flyTo({
          center: [lng, lat],
          zoom: zoom,
          duration: 300, // Much faster - 300ms
          curve: 1.2, // Reduced curve for quicker animation
          easing: (t) => t // Linear easing for snappy feel
        });
      }
    });

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);

    this.markers.set(`cluster-${clusterId}`, marker);
  }

  private createAgencyMarker(
    map: mapboxgl.Map,
    lng: number,
    lat: number,
    agency: PHAAgency,
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
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
      scale: 0.9 // Slightly larger than before
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
    
    // Add a pulsing effect to draw attention
    element.style.animation = 'pulse 2s ease-in-out infinite';
    
    // Create the pulse animation if it doesn't exist
    if (!document.querySelector('#marker-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'marker-pulse-animation';
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.2)';
      element.style.animation = 'none';
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
      element.style.animation = 'pulse 2s ease-in-out infinite';
    });

    marker.addTo(map);
    this.markers.set(`agency-${agency.id}`, marker);
  }

  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
  }

  getMarkerCount(): number {
    return this.markers.size;
  }
} 