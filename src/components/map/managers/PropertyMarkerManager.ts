import mapboxgl from 'mapbox-gl';
import { Property } from '@/types/property';
import { BaseMarkerManager } from './BaseMarkerManager';

interface PropertyMarkerManagerOptions {
  onClick?: (property: Property) => void;
  color?: string;
}

export class PropertyMarkerManager extends BaseMarkerManager {
  private propertiesMap: Map<string, { property: Property; marker: mapboxgl.Marker }> = new Map();
  private onClick?: (property: Property) => void;
  private color: string;
  private selectedPropertyId: string | null = null;
  private selectedMarker: mapboxgl.Marker | null = null;
  
  constructor(options: PropertyMarkerManagerOptions = {}) {
    super();
    this.onClick = options.onClick;
    this.color = options.color || '#EF4444';
  }
  
  addPropertyMarkers(map: mapboxgl.Map, properties: Property[]): void {
    this.clearMarkers();
    
    properties.forEach(property => {
      const marker = this.createPropertyMarker(property);
      if (marker) {
        marker.addTo(map);
        this.addMarker(marker);
        this.propertiesMap.set(property.id, { property, marker });
      }
    });
    
    console.log(`✅ Added ${this.markers.length} property markers`);
  }
  
  private createPropertyMarker(property: Property): mapboxgl.Marker | null {
    if (!property.latitude || !property.longitude) {
      console.warn(`Property ${property.name} has no coordinates`);
      return null;
    }
    
    // Create marker using Mapbox default style (same as PHA markers but red)
    const marker = new mapboxgl.Marker({
      color: this.color, // Red color
      scale: 0.8 // Same scale as PHA markers
    })
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
    
    // Click handler with visual selection
    if (this.onClick) {
      marker.getElement().addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🏠 Property marker clicked:', property.name, property.id);
        
        // Reset previous selected marker
        if (this.selectedMarker && this.selectedMarker !== marker) {
          const prevElement = this.selectedMarker.getElement();
          prevElement.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
          prevElement.style.zIndex = 'auto';
        }
        
        // Mark this pin as selected with visual feedback
        this.selectedPropertyId = property.id;
        this.selectedMarker = marker;
        const element = marker.getElement();
        
        // Use filter effects for selection
        element.style.filter = 'brightness(1.3) saturate(1.5) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))';
        element.style.zIndex = '2000';
        
        this.onClick!(property);
      });
    }
    
    // Add hover effects
    const element = marker.getElement();
    element.style.cursor = 'pointer';
    element.style.transition = 'filter 0.2s ease';
    
    // Disable mobile touch highlights
    (element.style as any).webkitTapHighlightColor = 'transparent';
    (element.style as any).webkitTouchCallout = 'none';
    element.style.userSelect = 'none';
    element.style.outline = 'none';
    
    element.addEventListener('mouseenter', () => {
      if (marker !== this.selectedMarker) {
        element.style.filter = 'brightness(1.2) saturate(1.3) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
        element.style.zIndex = '1000';
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (marker !== this.selectedMarker) {
        element.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
        element.style.zIndex = 'auto';
      }
    });
    
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
      element.style.filter = 'brightness(1.3) saturate(1.5) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))';
      element.style.zIndex = '2000';
      this.selectedPropertyId = propertyId;
      this.selectedMarker = entry.marker;
    }
  }
  
  clearSelection(): void {
    if (this.selectedMarker) {
      const element = this.selectedMarker.getElement();
      element.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
      element.style.zIndex = 'auto';
      this.selectedMarker = null;
      this.selectedPropertyId = null;
    }
  }
  
  clearMarkers(): void {
    super.clearMarkers();
    this.propertiesMap.clear();
    this.selectedPropertyId = null;
    this.selectedMarker = null;
  }
}
