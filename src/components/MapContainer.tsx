import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Database } from "@/integrations/supabase/types";
import { MapInitializer } from "./map/MapInitializer";
import { MapMarkerManager } from "./map/MapMarkerManager";
import { PropertyMarkerManager } from "./map/managers/PropertyMarkerManager";
import { Map3DControls } from "./map/Map3DControls";
import { Property } from "@/types/property";
import { useSearchMap } from "@/contexts/SearchMapContext";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface MapContainerProps {
  mapboxToken: string;
  phaAgencies: PHAAgency[];
  onOfficeSelect: (office: PHAAgency | Property) => void;
  onTokenError: (error: string) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  selectedOffice?: PHAAgency | Property | null;
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
  const propertyMarkerManager = useRef<PropertyMarkerManager>(new PropertyMarkerManager({
    onClick: onOfficeSelect as (property: Property) => void,
    color: '#EF4444'
  }));
  const hasLocationRestrictions = useRef<boolean>(false);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Get properties and toggle states from context
  const { state } = useSearchMap();
  const { filteredProperties, showPHAs, showProperties } = state;

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number, options?: any) => {
      if (map.current) {
        console.log('🚀 MapContainer.flyTo called with:', {
          center,
          zoom,
          centerFormatted: `[lng: ${center[0]}, lat: ${center[1]}]`,
          options
        });
        
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
        
        console.log('🚁 Executing flyTo with options:', flyToOptions);
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
      console.log('✅ Map loaded successfully');
      setIsMapReady(true);
    });

    map.current.on('styledata', () => {
      // Map style loaded successfully
    });

    map.current.on('idle', () => {
      // Map initialization complete with 3D features
    });
    
    // Debug: Track all map movements
    map.current.on('movestart', () => {
      console.log('🚀 Map movement started');
      console.trace('Movement stack trace');
    });
    
    map.current.on('moveend', () => {
      const center = map.current!.getCenter();
      const zoom = map.current!.getZoom();
      console.log('🏁 Map movement ended at:', {
        center: [center.lng.toFixed(4), center.lat.toFixed(4)],
        zoom: zoom.toFixed(2)
      });
    });

    // Add 3D controls and features
    Map3DControls.addControls(map.current);
    Map3DControls.setup3DFeatures(map.current);

    return () => {
      setIsMapReady(false);
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, onTokenError, onBoundsChange]);

  // Handle selected office changes (no visual pin changes needed)
  useEffect(() => {
    if (map.current?.loaded()) {
      if (selectedOffice) {
        console.log('📌 Office selected - showing in info panel:', selectedOffice.name);
        // Visual selection is handled by the marker click event
      } else {
        console.log('📌 Office deselected - clearing visual selection');
        // Clear visual selection when no office is selected
        markerManager.current.clearSelection();
        propertyMarkerManager.current.clearSelection();
      }
    }
  }, [selectedOffice]);

  // Add map move listener for viewport-based rendering
  useEffect(() => {
    if (!map.current || !isMapReady) return;
    
    const updateVisibleMarkers = () => {
      if (!map.current) return;
      
      console.log('🔄 updateVisibleMarkers called', { showPHAs, showProperties });
      
      const bounds = map.current.getBounds();
      const zoom = map.current.getZoom();
      
      // Don't render markers when zoomed out too far (performance optimization)
      if (zoom < 8) {
        console.log('🔍 Zoom level too low, clearing all markers for performance');
        markerManager.current.clearAllAgencyMarkers();
        propertyMarkerManager.current.clearMarkers();
        return;
      }
      
      // Filter to only visible markers with some padding
      const padding = 0.1; // Add padding to bounds for smoother experience
      const expandedBounds = bounds.extend(
        new mapboxgl.LngLatBounds(
          [bounds.getWest() - padding, bounds.getSouth() - padding],
          [bounds.getEast() + padding, bounds.getNorth() + padding]
        )
      );
      
      const visiblePHAs = showPHAs ? phaAgencies.filter(pha => {
        if (!pha.latitude || !pha.longitude || !expandedBounds) return false;
        return expandedBounds.contains([pha.longitude, pha.latitude]);
      }) : [];
      
      const visibleProperties = showProperties ? filteredProperties.filter(prop => {
        if (!prop.latitude || !prop.longitude || !expandedBounds) return false;
        return expandedBounds.contains([prop.longitude, prop.latitude]);
      }) : [];
      
      // Limit markers on mobile for performance
      const isMobile = window.innerWidth < 768;
      const maxMarkersPerType = isMobile ? 50 : 200;
      
      const limitedPHAs = visiblePHAs.slice(0, maxMarkersPerType);
      const limitedProperties = visibleProperties.slice(0, maxMarkersPerType);
      
      console.log('📊 Visible counts:', { 
        visiblePHAs: visiblePHAs.length, 
        visibleProperties: visibleProperties.length,
        limitedPHAs: limitedPHAs.length,
        limitedProperties: limitedProperties.length,
        isMobile,
        zoom: zoom.toFixed(1)
      });
      
      // Always update PHAs when toggle changes
      if (!showPHAs) {
        console.log('🔄 Clearing all PHA markers (toggle off)');
        markerManager.current.clearAllAgencyMarkers();
      } else if (limitedPHAs.length > 0) {
        console.log(`🔄 Displaying ${limitedPHAs.length} PHA markers`);
        markerManager.current.clearAllAgencyMarkers();
        markerManager.current.displayAllPHAsAsIndividualPins(
          map.current, 
          limitedPHAs, 
          onOfficeSelect as (office: PHAAgency) => void
        );
      } else if (showPHAs && limitedPHAs.length === 0) {
        console.log('🔄 No visible PHAs in current viewport');
        markerManager.current.clearAllAgencyMarkers();
      }
      
      // Always update Properties when toggle changes
      if (!showProperties) {
        console.log('🔄 Clearing all property markers (toggle off)');
        propertyMarkerManager.current.clearMarkers();
      } else if (limitedProperties.length > 0) {
        console.log(`🔄 Displaying ${limitedProperties.length} property markers`);
        propertyMarkerManager.current.clearMarkers();
        propertyMarkerManager.current.addPropertyMarkers(
          map.current,
          limitedProperties
        );
      } else if (showProperties && limitedProperties.length === 0) {
        console.log('🔄 No visible properties in current viewport');
        propertyMarkerManager.current.clearMarkers();
      }
      
      // Show warning if markers were limited
      if (isMobile && (visiblePHAs.length > maxMarkersPerType || visibleProperties.length > maxMarkersPerType)) {
        console.log('⚠️ Markers limited for mobile performance');
      }
    };
    
    // Debounced version to avoid too many updates
    let moveTimeout: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(moveTimeout);
      // Shorter debounce on mobile for more responsive feel
      const debounceDelay = window.innerWidth < 768 ? 150 : 300;
      moveTimeout = setTimeout(updateVisibleMarkers, debounceDelay);
    };
    
    // Add event listeners
    map.current.on('moveend', debouncedUpdate);
    map.current.on('zoomend', debouncedUpdate);
    
    // Update immediately when effect runs (toggle changes)
    updateVisibleMarkers();
    
    return () => {
      if (map.current) {
        map.current.off('moveend', debouncedUpdate);
        map.current.off('zoomend', debouncedUpdate);
      }
      clearTimeout(moveTimeout);
    };
  }, [phaAgencies, filteredProperties, onOfficeSelect, isMapReady, showPHAs, showProperties]);

  // Track the last rendered PHAs to prevent unnecessary updates
  const lastPhaAgenciesRef = useRef<PHAAgency[]>([]);
  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Set MORE RESTRICTIVE zoom limits for better performance
    // Users can't zoom out much after searching - they need to use search bar for new locations
    map.current.setMinZoom(8);   // Allow zooming out to see wider area - was 11, now 8
    map.current.setMaxZoom(18);  // Can still zoom in to street level
    
    hasLocationRestrictions.current = true;
    console.log('✅ Location restrictions applied successfully - MinZoom: 8, MaxZoom: 18');
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

  // Display PHAs on the map with improved logic
  useEffect(() => {
    console.log('🗺️ Map data update - PHAs:', phaAgencies?.length || 0, 'Map ready:', isMapReady, 'Map loaded:', map.current?.loaded(), 'Selected location:', selectedLocation?.name, 'Selected office:', selectedOffice?.name);
    
    // Clear any existing timeout
    if (displayTimeoutRef.current) {
      clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = null;
    }
    
    // Log details about the first few PHAs to check coordinates
    if (phaAgencies && phaAgencies.length > 0) {
      console.log('📍 First 3 PHAs details:', phaAgencies.slice(0, 3).map(pha => ({
        name: pha.name,
        city: pha.city,
        latitude: pha.latitude,
        longitude: pha.longitude,
        hasCoords: !!(pha.latitude && pha.longitude)
      })));
    }
    
    if (isMapReady && map.current?.loaded()) {
      // Skip this old logic - markers now handled by toggle-based rendering
                  return;
                }
  }, [phaAgencies, selectedLocation, selectedOffice, mapboxToken, onOfficeSelect, isMapReady]);



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
      {!selectedLocation && !selectedOffice && phaAgencies.length === 0 && filteredProperties.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Search for a Location</h3>
          <p className="text-sm text-gray-600">Search for a city, county, or state to find housing assistance options in your area</p>
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
