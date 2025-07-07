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
      radius: 60, // Cluster radius in pixels
      maxZoom: 14, // Max zoom to cluster points on
      minPoints: 2 // Minimum points to form a cluster
    });
  }

  updateClusters(
    map: mapboxgl.Map,
    agencies: PHAAgency[],
    onOfficeSelect: (office: PHAAgency) => void
  ): void {
    // Clear existing markers
    this.clearMarkers();

    // Convert agencies to GeoJSON features
    const features: GeoJSON.Feature<GeoJSON.Point, AgencyProperties>[] = agencies
      .filter(agency => {
        const lat = (agency as any).geocoded_latitude;
        const lng = (agency as any).geocoded_longitude;
        return lat && lng;
      })
      .map(agency => ({
        type: 'Feature' as const,
        properties: { agency },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            (agency as any).geocoded_longitude,
            (agency as any).geocoded_latitude
          ]
        }
      }));

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
    // Create marker with custom styling
    const marker = new mapboxgl.Marker({
      color: '#10b981',
      scale: 0.8
    })
    .setLngLat([lng, lat])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${agency.name}</h3>
            ${agency.address ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${agency.address}</p>` : ''}
            ${agency.phone ? `<p style="margin: 0; font-size: 14px; color: #6b7280;">📞 ${agency.phone}</p>` : ''}
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

    // Style the marker element
    const element = marker.getElement();
    element.style.cursor = 'pointer';
    element.style.transition = 'all 0.2s ease';
    
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.1)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
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