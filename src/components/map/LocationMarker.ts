
import mapboxgl from 'mapbox-gl';
import { GoogleMapsService } from '@/services/googleMapsService';

export interface LocationMarkerOptions {
  lat: number;
  lng: number;
  name: string;
  mapboxToken?: string;
  showHoverCard?: boolean;
  color?: 'red' | 'blue' | 'green'; // Add color option
}

export class LocationMarker {
  private marker: mapboxgl.Marker | null = null;

  create(options: LocationMarkerOptions): mapboxgl.Marker {
    const { lat, lng, name, showHoverCard = true, color = 'red' } = options;
    
    // Create marker container
    const markerElement = this.createMarkerElement();
    const innerContainer = this.createInnerContainer();
    const pinShape = this.createPinShape(color);
    const innerDot = this.createInnerDot();
    const pulseRing = this.createPulseRing(color);
    
    // Only create hover card if showHoverCard is true
    let hoverCard: HTMLDivElement | null = null;
    if (showHoverCard) {
      hoverCard = this.createHoverCard(name, lat, lng);
    }
    
    // Assemble marker
    pinShape.appendChild(innerDot);
    innerContainer.appendChild(pulseRing);
    innerContainer.appendChild(pinShape);
    markerElement.appendChild(innerContainer);
    
    if (hoverCard) {
      markerElement.appendChild(hoverCard);
      // Add hover events only if hover card exists
      this.addHoverEvents(markerElement, innerContainer, hoverCard);
    } else {
      // Add basic hover effect without card
      this.addBasicHoverEffect(innerContainer);
    }
    
    // Add CSS if not already added
    this.addStyles();
    
    return new mapboxgl.Marker({ 
      element: markerElement,
      anchor: 'bottom'
    }).setLngLat([lng, lat]);
  }

  private createMarkerElement(): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'location-marker-container';
    element.style.cssText = `
      position: relative;
      width: 32px;
      height: 40px;
      cursor: pointer;
    `;
    return element;
  }

  private createInnerContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'location-marker-inner';
    container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      transition: transform 0.2s ease;
    `;
    return container;
  }

  private createPinShape(color: string): HTMLDivElement {
    const pin = document.createElement('div');
    
    // Define color gradients
    const colorMap = {
      red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    };
    
    pin.style.cssText = `
      width: 32px;
      height: 32px;
      background: ${colorMap[color as keyof typeof colorMap] || colorMap.red};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    return pin;
  }

  private createInnerDot(): HTMLDivElement {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
    `;
    return dot;
  }

  private createPulseRing(color: string): HTMLDivElement {
    const ring = document.createElement('div');
    ring.className = 'pulse-ring';
    
    // Define pulse ring colors
    const ringColorMap = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981'
    };
    
    ring.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      border: 2px solid ${ringColorMap[color as keyof typeof ringColorMap] || ringColorMap.red};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s infinite;
      opacity: 0.6;
    `;
    return ring;
  }

  private createHoverCard(name: string, lat: number, lng: number): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'location-hover-card';
    card.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      padding: 0;
      min-width: 280px;
      max-width: 320px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      pointer-events: none;
      overflow: hidden;
    `;
    
    // Get Google Maps images
    const streetViewImage = GoogleMapsService.getStreetViewImageByCoords(lat, lng, '280x160');
    const staticMapImage = GoogleMapsService.getStaticMapImageByCoords(lat, lng, '280x160');
    
    card.innerHTML = `
      <div style="position: relative;">
        <img 
          src="${streetViewImage}" 
          alt="Street View of ${name}"
          style="
            width: 100%;
            height: 160px;
            object-fit: cover;
            border-radius: 12px 12px 0 0;
          "
          onerror="this.src='${staticMapImage}'; this.onerror=null;"
        />
        <div style="
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        ">📍 Google Maps</div>
      </div>
      <div style="padding: 16px; text-align: center;">
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
          margin-bottom: 8px;
        ">📍 ${name}</div>
        <div style="
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        ">Selected Location</div>
        <div style="
          font-size: 12px;
          color: #9ca3af;
        ">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid white;
      "></div>
    `;
    
    return card;
  }

  private addHoverEvents(markerElement: HTMLDivElement, innerContainer: HTMLDivElement, hoverCard: HTMLDivElement): void {
    markerElement.addEventListener('mouseenter', () => {
      hoverCard.style.opacity = '1';
      hoverCard.style.visibility = 'visible';
      // Use filter effects instead of scale to avoid marker movement
      innerContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1) saturate(1.2)';
    });

    markerElement.addEventListener('mouseleave', () => {
      hoverCard.style.opacity = '0';
      hoverCard.style.visibility = 'hidden';
      // Reset filter effects
      innerContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
    });
  }

  private addBasicHoverEffect(innerContainer: HTMLDivElement): void {
    innerContainer.addEventListener('mouseenter', () => {
      // Use filter effects instead of scale to avoid marker movement
      innerContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1) saturate(1.2)';
    });

    innerContainer.addEventListener('mouseleave', () => {
      // Reset filter effects
      innerContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
    });
  }

  private addStyles(): void {
    if (!document.querySelector('#location-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'location-marker-styles';
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
        .location-hover-card {
          font-family: system-ui, -apple-system, sans-serif;
        }
        .location-hover-card img {
          transition: transform 0.2s ease;
        }
        .location-hover-card:hover img {
          transform: scale(1.02);
        }
      `;
      document.head.appendChild(style);
    }
  }

  remove(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }
}
