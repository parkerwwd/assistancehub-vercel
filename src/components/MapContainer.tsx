import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from "@/integrations/supabase/types";
import { MapInitializer } from "./map/MapInitializer";
import { MapMarkerManager } from "./map/MapMarkerManager";
import { Map3DControls } from "./map/Map3DControls";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface MapContainerProps {
  mapboxToken: string;
  phaAgencies: PHAAgency[];
  onOfficeSelect: (office: PHAAgency) => void;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  selectedOffice?: PHAAgency | null;
  selectedLocation?: { lat: number; lng: number; name: string } | null;
}

export interface MapContainerRef {
  flyTo: (center: [number, number], zoom: number, options?: any) => void;
  getBounds: () => mapboxgl.LngLatBounds | null;
  setLocationMarker: (lat: number, lng: number, name: string, showHoverCard?: boolean) => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  mapboxToken, 
  phaAgencies,
  onOfficeSelect, 
  onTokenError,
  onBoundsChange,
  selectedOffice,
  selectedLocation
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerManager = useRef<MapMarkerManager>(new MapMarkerManager());
  const hasLocationRestrictions = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number, options?: any) => {
      if (map.current) {
        console.log('🚀 Flying to:', center, 'zoom:', zoom);
        // Use much faster defaults for snappy animations
        const flyToOptions = {
          center,
          zoom,
          duration: 300, // Much faster - 300ms
          curve: 1.2, // Slightly reduced curve for quicker animation
          easing: (t: number) => t, // Linear easing for snappy feel
          essential: true,
          ...options // Allow override of defaults
        };
        
        map.current.flyTo(flyToOptions);
      } else {
        console.warn('⚠️ Map not initialized yet');
      }
    },
    getBounds: () => {
      return map.current?.getBounds() || null;
    },
    setLocationMarker: (lat: number, lng: number, name: string, showHoverCard: boolean = true) => {
      if (!map.current) return;
      console.log('📍 setLocationMarker called with:', { lat, lng, name });
      markerManager.current.setLocationMarker(map.current, lat, lng, name, mapboxToken, showHoverCard);
    }
  }));

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const mapInstance = MapInitializer.createMap({
      container: mapContainer.current,
      mapboxToken,
      onTokenError,
      onBoundsChange
    });

    if (!mapInstance) return;

    map.current = mapInstance;

    // Setup map load events
    map.current.on('load', () => {
      // Map loaded successfully
    });

    map.current.on('styledata', () => {
      // Map style loaded successfully
    });

    map.current.on('idle', () => {
      // Map initialization complete with 3D features
    });

    // Add 3D controls and features
    Map3DControls.addControls(map.current);
    Map3DControls.setup3DFeatures(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, onTokenError, onBoundsChange]);

  // Update marker when selected office changes
  useEffect(() => {
    if (map.current?.loaded()) {
      markerManager.current.clearOfficeMarkers();
      
      if (selectedOffice) {
        setTimeout(() => {
          markerManager.current.addSelectedOfficeMarker(
            map.current!, 
            selectedOffice, 
            mapboxToken, 
            onOfficeSelect
          );
        }, 100);
      } else {
        markerManager.current.resetToOverviewStyle(map.current);
      }
    }
  }, [selectedOffice, mapboxToken, onOfficeSelect]);

  // Track the last rendered PHAs to prevent unnecessary updates
  const lastPhaAgenciesRef = useRef<PHAAgency[]>([]);

  // Apply location-based zoom and bounds restrictions
  const applyLocationRestrictions = (lat: number, lng: number, radiusMiles: number = 50) => {
    if (!map.current) return;

    console.log('🔒 Applying location restrictions - Center:', { lat, lng }, 'Radius:', radiusMiles, 'miles');

    // Calculate bounds for the restricted area
    // More accurate calculation accounting for latitude
    const latRadians = lat * Math.PI / 180;
    const degLatKm = 110.574; // km per degree of latitude
    const degLonKm = 111.320 * Math.cos(latRadians); // km per degree of longitude at this latitude
    
    const radiusKm = radiusMiles * 1.60934; // Convert miles to km
    const latDegrees = radiusKm / degLatKm;
    const lngDegrees = radiusKm / degLonKm;
    
    // Add some padding to the bounds (20% extra)
    const padding = 1.2;
    const bounds = new mapboxgl.LngLatBounds(
      [lng - (lngDegrees * padding), lat - (latDegrees * padding)], // Southwest
      [lng + (lngDegrees * padding), lat + (latDegrees * padding)]  // Northeast
    );

    console.log('📐 Calculated bounds:', {
      sw: [lng - (lngDegrees * padding), lat - (latDegrees * padding)],
      ne: [lng + (lngDegrees * padding), lat + (latDegrees * padding)]
    });

    // Set max bounds to restrict panning
    map.current.setMaxBounds(bounds);
    
    // Set zoom restrictions based on search type
    // For city searches, allow closer zoom but restrict zooming out too far
    map.current.setMinZoom(9);   // Can't zoom out beyond metro area view
    map.current.setMaxZoom(18);  // Can zoom in to street level
    
    hasLocationRestrictions.current = true;
    console.log('✅ Location restrictions applied successfully');
  };

  // Remove all restrictions
  const removeLocationRestrictions = () => {
    if (!map.current) return;

    // Remove bounds restrictions
    map.current.setMaxBounds(undefined);
    
    // Reset zoom restrictions to defaults
    map.current.setMinZoom(0);
    map.current.setMaxZoom(22);
    
    hasLocationRestrictions.current = false;
    console.log('🔓 Removed location restrictions');
  };

  // Display PHAs on the map (only when there's a location search)
  useEffect(() => {
    console.log('🗺️ Map data update - PHAs:', phaAgencies?.length || 0, 'Map loaded:', map.current?.loaded(), 'Selected location:', selectedLocation?.name);
    
    if (map.current?.loaded() && !selectedOffice) {
      // Only show PHAs if there's a selected location (search active)
      if (selectedLocation && phaAgencies && phaAgencies.length > 0) {
        // Check if PHAs have actually changed to prevent unnecessary re-renders
        const phasChanged = phaAgencies.length !== lastPhaAgenciesRef.current.length ||
          phaAgencies.some((pha, index) => pha.id !== lastPhaAgenciesRef.current[index]?.id);
        
        if (phasChanged) {
          console.log('🎯 Location search - displaying', phaAgencies.length, 'PHAs near', selectedLocation.name);
          lastPhaAgenciesRef.current = phaAgencies;
          
          // Clear existing markers first
          markerManager.current.clearAllAgencyMarkers();
          markerManager.current.clearLocationMarker();
          
          // Display PHAs as individual pins
          markerManager.current.displayAllPHAsAsIndividualPins(
            map.current, 
            phaAgencies,
            onOfficeSelect
          );
        }
        
        // Add location marker
        console.log('📍 Adding location marker for:', selectedLocation.name);
        markerManager.current.setLocationMarker(
          map.current,
          selectedLocation.lat,
          selectedLocation.lng,
          selectedLocation.name,
          mapboxToken
        );
        
        // Apply zoom and bounds restrictions after a delay to let the map fly to location first
        setTimeout(() => {
          applyLocationRestrictions(selectedLocation.lat, selectedLocation.lng);
        }, 500); // Wait for fly animation to complete
        
      } else if (!selectedLocation) {
        // No location selected - clear everything and remove restrictions
        console.log('🧹 No location selected - clearing map');
        markerManager.current.clearAllAgencyMarkers();
        markerManager.current.clearLocationMarker();
        removeLocationRestrictions();
        lastPhaAgenciesRef.current = [];
        
        // Reset map to US view when clearing search
        if (map.current) {
          map.current.flyTo({
            center: [-95.7129, 37.0902],
            zoom: 4,
            duration: 300
          });
        }
      }
    } else if (map.current?.loaded() && selectedOffice) {
      // Clear location search markers when an office is selected
      markerManager.current.clearAllAgencyMarkers();
      markerManager.current.clearLocationMarker();
    }
  }, [phaAgencies, selectedLocation, selectedOffice, mapboxToken, onOfficeSelect]);



  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
        🗺️ Street Map
      </div>
      {!selectedLocation && !selectedOffice && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Search for a Location</h3>
          <p className="text-sm text-gray-600">Enter a city, state, or county in the search bar above to view PHAs in that area</p>
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
