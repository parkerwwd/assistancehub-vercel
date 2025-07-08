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
      radius: 20, // Further reduced - cluster radius in pixels
      maxZoom: 18, // Show individual pins at even higher zoom levels
      minPoints: 10 // Significantly increased - need at least 10 PHAs to form a cluster
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
    console.log(`🌍 Processing ${agencies.length} PHAs for clustering`);

    // Convert agencies to GeoJSON features with better coordinate validation
    const features: GeoJSON.Feature<GeoJSON.Point, AgencyProperties>[] = [];
    const missingCoordinates: PHAAgency[] = [];

    agencies.forEach(agency => {
      // Get coordinates with validation
      let lat = agency.latitude;
      let lng = agency.longitude;
      
      // If database doesn't have coordinates, check for geocoded ones
      if (!lat || !lng) {
        const geocodedAgency = agency as any;
        lat = geocodedAgency.geocoded_latitude;
        lng = geocodedAgency.geocoded_longitude;
      }
      
      // Comprehensive coordinate validation
      if (!lat || !lng || 
          typeof lat !== 'number' || typeof lng !== 'number' ||
          isNaN(lat) || isNaN(lng) || 
          !isFinite(lat) || !isFinite(lng) ||
          lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn(`⚠️ Cluster: Invalid coordinates for PHA: ${agency.name}`, {
          id: agency.id,
          name: agency.name,
          dbLat: agency.latitude,
          dbLng: agency.longitude,
          processedLat: lat,
          processedLng: lng,
          latType: typeof lat,
          lngType: typeof lng,
          isLatNaN: isNaN(lat),
          isLngNaN: isNaN(lng),
          isLatFinite: isFinite(lat),
          isLngFinite: isFinite(lng)
        });
        missingCoordinates.push(agency);
        return;
      }

      features.push({
        type: 'Feature' as const,
        properties: { agency },
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        }
      });
    });

    console.log(`✅ ${features.length} PHAs have valid coordinates for clustering`);
    
    if (missingCoordinates.length > 0) {
      console.log(`❌ ${missingCoordinates.length} PHAs missing coordinates`, {
        totalPHAs: agencies.length,
        withCoordinates: features.length,
        missingCoordinates: missingCoordinates.length,
        missingAddresses: missingCoordinates.filter(pha => !pha.address).length
      });
    }

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

    console.log(`🔍 Found ${clusters.length} clusters/points at zoom level ${Math.floor(zoom)}`);

    // Create markers for each cluster/point
    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      
      // Validate cluster coordinates before creating markers
      if (!lng || !lat || 
          typeof lat !== 'number' || typeof lng !== 'number' ||
          isNaN(lat) || isNaN(lng) || 
          !isFinite(lat) || !isFinite(lng) ||
          lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error(`❌ Invalid cluster coordinates:`, {
          lng, lat,
          latType: typeof lat,
          lngType: typeof lng,
          isLatNaN: isNaN(lat),
          isLngNaN: isNaN(lng),
          isLatFinite: isFinite(lat),
          isLngFinite: isFinite(lng)
        });
        return;
      }
      
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

    // Add hover effect without transform to avoid movement
    el.addEventListener('mouseenter', () => {
      // Use filter effects instead of transform to avoid movement
      el.style.filter = 'brightness(1.2) saturate(1.3) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
      el.style.backgroundColor = '#2563eb';
    });
    el.addEventListener('mouseleave', () => {
      // Reset filter effects
      el.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
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
    
    if (programType.includes('section 8') || programType.includes('hcv')) {
      markerColor = '#3b82f6'; // Blue for Section 8/HCV
    } else if (programType.includes('combined')) {
      markerColor = '#a855f7'; // Purple for Combined
    } else if (programType.includes('low-rent') || programType.includes('public housing')) {
      markerColor = '#10b981'; // Green for Low-Rent/Public Housing
    } else if (programType.includes('mod rehab')) {
      markerColor = '#f59e0b'; // Orange for Mod Rehab
    }
    
    // Create marker with custom styling
    const marker = new mapboxgl.Marker({
      color: markerColor,
      scale: 0.9 // Slightly larger than individual pins
    })
    .setLngLat([lng, lat])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 12px; max-width: 280px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${agency.name}</h3>
            ${agency.address ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">📍 ${agency.address}</p>` : ''}
            ${agency.phone ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280;">📞 ${agency.phone}</p>` : ''}
            ${agency.email ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280;">📧 ${agency.email}</p>` : ''}
            ${agency.program_type ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: ${markerColor}; font-weight: 500; padding: 2px 8px; background: ${markerColor}15; border-radius: 4px; display: inline-block;">🏢 ${agency.program_type}</p>` : ''}
            ${agency.waitlist_status ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">📋 Waitlist: ${agency.waitlist_status}</p>` : ''}
            <button 
              onclick="window.postMessage({ type: 'selectOffice', officeId: '${agency.id}' }, '*')"
              style="margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; transition: background 0.2s;"
              onmouseover="this.style.background='#2563eb'"
              onmouseout="this.style.background='#3b82f6'"
            >
              View Details
            </button>
          </div>
        `)
    );

    // Add click handler with event prevention
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('🎯 Cluster pin clicked:', agency.name);
      onOfficeSelect(agency);
    });

    // Enhanced styling for the marker element
    const element = marker.getElement();
    element.style.cursor = 'pointer';
    element.style.transition = 'filter 0.2s ease, box-shadow 0.2s ease';
    element.title = agency.name; // Add tooltip
    
    // Add subtle hover effect only
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