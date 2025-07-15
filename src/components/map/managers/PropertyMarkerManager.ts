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
    console.log(`🏠 PropertyMarkerManager.addPropertyMarkers called with ${properties.length} properties`);
    
    // Clear existing markers first
    this.clearMarkers();
    this.propertiesMap.clear();
    
    let successCount = 0;
    let skipCount = 0;
    
    properties.forEach(property => {
      const marker = this.createPropertyMarker(property);
      if (marker) {
        marker.addTo(map);
        this.addMarker(marker);
        this.propertiesMap.set(property.id, { marker, property });
        successCount++;
      } else {
        skipCount++;
      }
    });
    
    console.log(`✅ Added ${successCount} property markers to map, skipped ${skipCount} (no coordinates)`);
  }
  
  private createPropertyMarker(property: Property): mapboxgl.Marker | null {
    if (!property.latitude || !property.longitude) {
      console.warn(`⚠️ Property ${property.name} (${property.id}) has no coordinates`);
      return null;
    }
    
    // Validate coordinates
    if (Math.abs(property.latitude) > 90 || Math.abs(property.longitude) > 180) {
      console.error(`❌ Invalid coordinates for property ${property.name}: lat=${property.latitude}, lng=${property.longitude}`);
      return null;
    }
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'property-marker';
    el.style.cssText = `
      width: 30px;
      height: 30px;
      background-color: ${this.color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 0.2s ease, box-shadow 0.2s ease, z-index 0.2s ease, background-color 0.2s ease;
    `;
    
    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = '🏠';
    icon.style.cssText = `
      font-size: 14px;
      filter: brightness(0) invert(1);
    `;
    el.appendChild(icon);
    
    // Hover effect
    el.addEventListener('mouseenter', () => {
      // Use filter effects instead of transform to avoid marker jumping
      el.style.filter = 'brightness(1.2) saturate(1.3) drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
      el.style.zIndex = '1000';
    });
    
    el.addEventListener('mouseleave', () => {
      // Reset filter effects
      el.style.filter = 'brightness(1) saturate(1)';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
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
        console.log('🏠 Property marker clicked:', property.name);
        this.onClick!(property);
      });
    }
    
    return marker;
  }
  
  highlightProperty(propertyId: string): void {
    const entry = this.propertiesMap.get(propertyId);
    if (entry) {
      const element = entry.marker.getElement();
      // Use filter effects instead of transform
      element.style.filter = 'brightness(1.3) saturate(1.5) drop-shadow(0 6px 16px rgba(0,0,0,0.5))';
      element.style.zIndex = '1000';
      element.style.backgroundColor = '#DC2626'; // Darker red when selected
    }
  }
  
  unhighlightAll(): void {
    this.propertiesMap.forEach(({ marker }) => {
      const element = marker.getElement();
      // Reset filter effects
      element.style.filter = 'brightness(1) saturate(1)';
      element.style.zIndex = '1';
      element.style.backgroundColor = this.color;
    });
  }
}
