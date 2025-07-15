import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyMapSectionProps {
  property: Property;
}

const PropertyMapSection: React.FC<PropertyMapSectionProps> = ({ property }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !property.latitude || !property.longitude) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";
    
    try {
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [property.longitude, property.latitude],
        zoom: 14,
        attributionControl: false
      });

      // Add attribution control in a better position
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker
      const el = document.createElement('div');
      el.className = 'property-detail-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #EF4444;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      const icon = document.createElement('div');
      icon.innerHTML = '🏠';
      icon.style.cssText = `
        font-size: 18px;
        filter: brightness(0) invert(1);
      `;
      el.appendChild(icon);

      marker.current = new mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${property.name}</h3>
            <p style="font-size: 14px; color: #666;">
              ${property.address}<br/>
              ${property.city}, ${property.state} ${property.zip}
            </p>
          </div>
        `);
      
      marker.current.setPopup(popup);
      
      // Add error handling for the map
      map.current.on('error', (e) => {
        console.error('❌ Property map error:', e);
        // The error is already logged, no need to show toast here
      });

    } catch (error) {
      console.error("Error initializing property map:", error);
      // The error is already logged, no need to show toast here
    }

    // Cleanup
    return () => {
      if (marker.current) marker.current.remove();
      if (map.current) map.current.remove();
    };
  }, [property]);

  if (!property.latitude || !property.longitude) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <MapPin className="w-5 h-5 text-gray-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Map not available for this property</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MapPin className="w-5 h-5 text-gray-600" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="h-96 rounded-b-lg" />
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">
            <strong>Address:</strong> {property.address}, {property.city}, {property.state} {property.zip}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMapSection; 