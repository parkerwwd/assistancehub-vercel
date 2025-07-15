import mapboxgl from 'mapbox-gl';
import { Property } from '@/types/property';
import { BaseMarkerManager } from './BaseMarkerManager';

interface PropertyMarkerOptions {
  onClick?: (property: Property) => void;
  color?: string;
}

export class PropertyMarkerManager extends BaseMarkerManager {
  private onClick?: (property: Property) => void;
  private color: string;
  private propertiesMap = new Map<string, { marker: mapboxgl.Marker; property: Property }>();
  
  constructor(options: PropertyMarkerOptions = {}) {
    super();
    this.onClick = options.onClick;
    this.color = options.color || '#EF4444'; // Red color for properties
  }
  
  addPropertyMarkers(map: mapboxgl.Map, properties: Property[]): void {
    // Clear existing markers first
    this.clearMarkers();
    this.propertiesMap.clear();
    
    properties.forEach(property => {
      const marker = this.createPropertyMarker(property);
      if (marker) {
        marker.addTo(map);
        this.addMarker(marker);
        this.propertiesMap.set(property.id, { marker, property });
      }
    });
    
    console.log(`✅ Added ${this.markers.length} property markers to map`);
  }
  
  private createPropertyMarker(property: Property): mapboxgl.Marker | null {
    if (!property.latitude || !property.longitude) {
      console.warn(`Property ${property.name} has no coordinates`);
      return null;
    }
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'property-marker';
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: ${this.color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    
    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = '🏠';
    icon.style.cssText = `
      font-size: 10px;
      filter: brightness(0) invert(1);
    `;
    el.appendChild(icon);
    
    // Hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.zIndex = '1000';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '1';
    });
    
    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([property.longitude, property.latitude]);
    
    // Add popup
    const popupContent = `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="font-weight: bold; margin-bottom: 4px;">${property.name}</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
          ${property.address}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}
        </p>
        ${property.rent_range_min || property.rent_range_max ? `
          <p style="font-size: 14px; color: #059669; font-weight: 500;">
            💵 ${this.formatRentRange(property)}
          </p>
        ` : ''}
        ${property.units_available ? `
          <p style="font-size: 14px; color: #2563EB;">
            🏠 ${property.units_available} units available
          </p>
        ` : ''}
        ${property.phone ? `
          <p style="font-size: 14px;">
            📞 ${property.phone}
          </p>
        ` : ''}
      </div>
    `;
    
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(popupContent);
    
    marker.setPopup(popup);
    
    // Click handler
    if (this.onClick) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onClick!(property);
      });
    }
    
    return marker;
  }
  
  private formatRentRange(property: Property): string {
    if (property.rent_range_min && property.rent_range_max) {
      return `$${property.rent_range_min} - $${property.rent_range_max}/mo`;
    }
    if (property.rent_range_min) return `From $${property.rent_range_min}/mo`;
    if (property.rent_range_max) return `Up to $${property.rent_range_max}/mo`;
    return 'Contact for pricing';
  }
  
  highlightProperty(propertyId: string): void {
    const entry = this.propertiesMap.get(propertyId);
    if (entry) {
      const element = entry.marker.getElement();
      element.style.transform = 'scale(1.2)';
      element.style.zIndex = '1000';
      element.style.backgroundColor = '#DC2626'; // Darker red when selected
    }
  }
  
  unhighlightAll(): void {
    this.propertiesMap.forEach(({ marker }) => {
      const element = marker.getElement();
      element.style.transform = 'scale(1)';
      element.style.zIndex = '1';
      element.style.backgroundColor = this.color;
    });
  }
}
