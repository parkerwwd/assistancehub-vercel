import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
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
  const [isMapReady, setIsMapReady] = useState(false);

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
      // Check if PHAs have actually changed to prevent unnecessary re-renders
      const phasChanged = phaAgencies.length !== lastPhaAgenciesRef.current.length ||
        phaAgencies.some((pha, index) => pha.id !== lastPhaAgenciesRef.current[index]?.id);
      
      console.log('🔍 PHA display check:', {
        phasChanged,
        selectedLocation: !!selectedLocation,
        lastPHAsLength: lastPhaAgenciesRef.current.length,
        currentPHAsLength: phaAgencies.length,
        condition1: phasChanged,
        condition2: selectedLocation && !lastPhaAgenciesRef.current.length,
        willDisplay: phasChanged || (selectedLocation && !lastPhaAgenciesRef.current.length)
      });
      
      // Only redraw PHAs if data has changed OR location changed OR we're switching from office selection back to overview
      // Simplified: Always display when we have a location and PHAs
      if ((phasChanged || selectedLocation) && phaAgencies.length > 0) {
        console.log('🎯 Displaying', phaAgencies.length, 'PHAs on map');
        lastPhaAgenciesRef.current = phaAgencies;
        
        // Clear existing markers first
        markerManager.current.clearAllAgencyMarkers();
        markerManager.current.clearLocationMarker();
        
        // Display PHAs based on context
        if (phaAgencies && phaAgencies.length > 0) {
          if (selectedLocation) {
            // Location search active - show as individual pins with location marker
            console.log('📍 Location search - displaying', phaAgencies.length, 'PHAs near', selectedLocation.name);
            
            // Check if map is idle and ready
            if (!map.current.isMoving()) {
              console.log('✅ Map is idle, displaying markers immediately');
              
              console.log('🎯 CALLING displayAllPHAsAsIndividualPins NOW');
              markerManager.current.displayAllPHAsAsIndividualPins(
                map.current!, 
                phaAgencies,
                onOfficeSelect
              );
              
              // Add location marker
              markerManager.current.setLocationMarker(
                map.current!,
                selectedLocation.lat,
                selectedLocation.lng,
                selectedLocation.name,
                mapboxToken
              );
              
              // Apply restrictions
              applyLocationRestrictions(selectedLocation.lat, selectedLocation.lng);
            } else {
              console.log('⏳ Map is moving, will display markers after delay');
              
              // Add a small delay to ensure map has finished any animations
              displayTimeoutRef.current = setTimeout(() => {
                console.log('🎯 Displaying markers after delay');
                
                // Double-check map is still loaded
                if (!map.current || !map.current.loaded()) {
                  console.error('❌ Map not loaded when trying to display markers');
                  return;
                }
                
                console.log('📍 About to call displayAllPHAsAsIndividualPins with:', {
                  mapLoaded: map.current.loaded(),
                  phaCount: phaAgencies.length,
                  firstPHA: phaAgencies[0] ? { name: phaAgencies[0].name, lat: phaAgencies[0].latitude, lng: phaAgencies[0].longitude } : 'none'
                });
                
                markerManager.current.displayAllPHAsAsIndividualPins(
                  map.current!, 
                  phaAgencies,
                  onOfficeSelect
                );
                
                // Add location marker
                markerManager.current.setLocationMarker(
                  map.current!,
                  selectedLocation.lat,
                  selectedLocation.lng,
                  selectedLocation.name,
                  mapboxToken
                );
                
                // Apply zoom and bounds restrictions after markers are placed
                setTimeout(() => {
                  applyLocationRestrictions(selectedLocation.lat, selectedLocation.lng);
                }, 100);
              }, 500); // 500ms delay to ensure map has settled
            }
          } else {
            // No location filter - show with clustering for better performance
            console.log('🌍 Overview mode - showing', phaAgencies.length, 'PHAs with clustering');
            markerManager.current.updateClusters(
              map.current,
              phaAgencies,
              onOfficeSelect
            );
            
            // Remove any location restrictions
            removeLocationRestrictions();
          }
        } else {
          // No PHAs to display
          console.log('🧹 No PHAs to display - clearing map');
          removeLocationRestrictions();
        }
      }
      
      // Handle location changes without PHA data changes
      if (!phasChanged && selectedLocation && phaAgencies.length > 0) {
        // Just update the location marker if PHAs haven't changed
        markerManager.current.setLocationMarker(
          map.current,
          selectedLocation.lat,
          selectedLocation.lng,
          selectedLocation.name,
          mapboxToken
        );
      }
      
      // Handle clearing location search
      // Only reset to US view if there's no selected location AND no selected office
      // AND we're not in the middle of displaying PHAs from a search
      const shouldResetToUSView = !selectedLocation && 
                                  !selectedOffice && 
                                  lastPhaAgenciesRef.current.length > 0 &&
                                  phaAgencies.length === 0; // Only reset if we've actually cleared the search
                                  
      if (shouldResetToUSView) {
        console.log('🧹 Location search cleared - switching to overview mode');
        console.log('🔍 Debug state:', {
          selectedLocation,
          selectedOffice: selectedOffice?.name,
          phaAgenciesLength: phaAgencies.length,
          lastPhaAgenciesLength: lastPhaAgenciesRef.current.length
        });
        removeLocationRestrictions();
        
        // Reset map to US view
        if (map.current) {
          console.log('🚨 RESETTING MAP TO US VIEW - This might be the issue!');
          console.log('🚨 Stack trace:', new Error().stack);
          map.current.flyTo({
            center: [-95.7129, 37.0902],
            zoom: 4,
            duration: 300
          });
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
        displayTimeoutRef.current = null;
      }
    };
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
      {!selectedLocation && !selectedOffice && phaAgencies.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No PHA Offices Found</h3>
          <p className="text-sm text-gray-600">Try searching for a specific location to find nearby housing authorities</p>
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
