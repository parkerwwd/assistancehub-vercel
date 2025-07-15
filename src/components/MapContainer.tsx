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
      }
    }
  }, [selectedOffice]);

  // Add map move listener for viewport-based rendering
  useEffect(() => {
    if (!map.current || !isMapReady) return;
    
    // Keep track of last rendered state to avoid unnecessary updates
    let lastRenderedPHACount = 0;
    let lastRenderedPropertyCount = 0;
    let lastShowPHAs = showPHAs;
    let lastShowProperties = showProperties;
    
    const updateVisibleMarkers = () => {
      if (!map.current) return;
      
      const bounds = map.current.getBounds();
      
      // Filter to only visible markers
      const visiblePHAs = showPHAs ? phaAgencies.filter(pha => {
        if (!pha.latitude || !pha.longitude || !bounds) return false;
        return bounds.contains([pha.longitude, pha.latitude]);
      }) : [];
      
      const visibleProperties = showProperties ? filteredProperties.filter(prop => {
        if (!prop.latitude || !prop.longitude || !bounds) return false;
        return bounds.contains([prop.longitude, prop.latitude]);
      }) : [];
      
      // Only update if there's a significant change
      const shouldUpdatePHAs = showPHAs !== lastShowPHAs || 
                              Math.abs(visiblePHAs.length - lastRenderedPHACount) > 5 ||
                              (showPHAs && lastRenderedPHACount === 0 && visiblePHAs.length > 0);
      
      const shouldUpdateProperties = showProperties !== lastShowProperties || 
                                   Math.abs(visibleProperties.length - lastRenderedPropertyCount) > 5 ||
                                   (showProperties && lastRenderedPropertyCount === 0 && visibleProperties.length > 0);
      
      // Update PHAs if needed
      if (shouldUpdatePHAs) {
        console.log(`🔄 Updating PHA markers: ${visiblePHAs.length} visible`);
        markerManager.current.clearAllAgencyMarkers();
        
        if (showPHAs && visiblePHAs.length > 0) {
          markerManager.current.displayAllPHAsAsIndividualPins(
            map.current, 
            visiblePHAs, 
            onOfficeSelect as (office: PHAAgency) => void
          );
        }
        
        lastRenderedPHACount = visiblePHAs.length;
        lastShowPHAs = showPHAs;
      }
      
      // Update Properties if needed
      if (shouldUpdateProperties) {
        console.log(`🔄 Updating property markers: ${visibleProperties.length} visible`);
        propertyMarkerManager.current.clearMarkers();
        
        if (showProperties && visibleProperties.length > 0) {
          propertyMarkerManager.current.addPropertyMarkers(
            map.current,
            visibleProperties
          );
        }
        
        lastRenderedPropertyCount = visibleProperties.length;
        lastShowProperties = showProperties;
      }
    };
    
    // Debounced version to avoid too many updates
    let moveTimeout: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(updateVisibleMarkers, 300); // Increased debounce time
    };
    
    map.current.on('moveend', debouncedUpdate);
    map.current.on('zoomend', debouncedUpdate);
    
    // Initial render with a slight delay to ensure map is fully ready
    setTimeout(updateVisibleMarkers, 500);
    
    // Also update immediately when toggle states change
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
