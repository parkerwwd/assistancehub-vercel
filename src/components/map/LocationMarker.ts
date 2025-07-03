
import mapboxgl from 'mapbox-gl';

export interface LocationMarkerOptions {
  lat: number;
  lng: number;
  name: string;
  mapboxToken?: string;
}

export class LocationMarker {
  private marker: mapboxgl.Marker | null = null;

  create(options: LocationMarkerOptions): mapboxgl.Marker {
    const { lat, lng, name, mapboxToken } = options;
    
    // Create marker container
    const markerElement = this.createMarkerElement();
    const innerContainer = this.createInnerContainer();
    const pinShape = this.createPinShape();
    const innerDot = this.createInnerDot();
    const pulseRing = this.createPulseRing();
    const hoverCard = this.createHoverCard(name, lat, lng, mapboxToken);
    
    // Assemble marker
    pinShape.appendChild(innerDot);
    innerContainer.appendChild(pulseRing);
    innerContainer.appendChild(pinShape);
    markerElement.appendChild(innerContainer);
    markerElement.appendChild(hoverCard);
    
    // Add hover events
    this.addHoverEvents(markerElement, innerContainer, hoverCard);
    
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

  private createPinShape(): HTMLDivElement {
    const pin = document.createElement('div');
    pin.style.cssText = `
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

  private createPulseRing(): HTMLDivElement {
    const ring = document.createElement('div');
    ring.className = 'pulse-ring';
    ring.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      border: 2px solid #ef4444;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s infinite;
      opacity: 0.6;
    `;
    return ring;
  }

  private createHoverCard(name: string, lat: number, lng: number, mapboxToken?: string): HTMLDivElement {
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
      padding: 12px;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      pointer-events: none;
    `;
    
    // Create location-specific image URL using Mapbox Static Images API
    let locationImageUrl = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&auto=format`;
    
    if (mapboxToken) {
      // Use Mapbox Static Images API to get satellite view of the specific location
      locationImageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},14,0/300x200@2x?access_token=${mapboxToken}`;
    }
    
    card.innerHTML = `
      <div style="text-align: center;">
        <img 
          src="${locationImageUrl}" 
          alt="${name}" 
          style="
            width: 180px; 
            height: 120px; 
            object-fit: cover; 
            border-radius: 8px; 
            margin-bottom: 8px;
          "
          onError="this.src='https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=200&fit=crop&auto=format'"
        />
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
          margin-bottom: 4px;
        ">📍 ${name}</div>
        <div style="
          font-size: 12px;
          color: #6b7280;
        ">Selected Location</div>
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
      innerContainer.style.transform = 'scale(1.1)';
    });
    
    markerElement.addEventListener('mouseleave', () => {
      hoverCard.style.opacity = '0';
      hoverCard.style.visibility = 'hidden';
      innerContainer.style.transform = 'scale(1)';
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
