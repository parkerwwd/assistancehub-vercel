
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import MapContainer, { MapContainerRef } from "@/components/MapContainer";
import { geocodePHAAddress } from "@/services/geocodingService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAMapSectionProps {
  office: PHAAgency;
}

const PHAMapSection: React.FC<PHAMapSectionProps> = ({ office }) => {
  const mapRef = useRef<MapContainerRef>(null);
  const [tokenError, setTokenError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [officeWithCoords, setOfficeWithCoords] = useState<PHAAgency | null>(null);
  const mapboxToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";

  const handleOfficeSelect = (selectedOffice: PHAAgency) => {
    console.log('Office selected on detail map:', selectedOffice.name);
  };

  // Geocode address and set location marker
  useEffect(() => {
    const geocodeAndSetMarker = async () => {
      if (!office.address || !mapRef.current) return;
      
      // Check if office already has coordinates
      if (office.latitude && office.longitude) {
        console.log('🗺️ PHAMapSection - Office already has coordinates:', { lat: office.latitude, lng: office.longitude });
        setOfficeWithCoords(office);
        
        // Fly to the location
        mapRef.current.flyTo([office.longitude, office.latitude], 17);
        return;
      }
      
      setIsGeocoding(true);
      
      try {
        console.log('🗺️ PHAMapSection - Geocoding address:', office.address);
        
        // Use the improved geocoding service
        const coordinates = await geocodePHAAddress(office.address, mapboxToken);
        
        if (coordinates) {
          const { lat, lng } = coordinates;
          
          // Create office with coordinates
          const officeWithLatLng = {
            ...office,
            latitude: lat,
            longitude: lng
          };
          setOfficeWithCoords(officeWithLatLng);
          
          // Fly to the location with zoom level 17
          mapRef.current.flyTo([lng, lat], 17);
          
          console.log('✅ PHAMapSection - Successfully geocoded and marked location:', office.name, { lat, lng });
        } else {
          console.warn('⚠️ PHAMapSection - No geocoding results for address:', office.address);
          // Still set the office even without coordinates
          setOfficeWithCoords(office);
        }
      } catch (error) {
        console.error('❌ PHAMapSection - Geocoding error:', error);
        // Still set the office even on error
        setOfficeWithCoords(office);
      } finally {
        setIsGeocoding(false);
      }
    };

    // Small delay to ensure map is fully loaded
    const timer = setTimeout(() => {
      geocodeAndSetMarker();
    }, 1000);

    return () => clearTimeout(timer);
  }, [office, mapboxToken]);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Map className="w-5 h-5 text-blue-600" />
          Office Location
          {isGeocoding && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 w-full relative">
          {tokenError ? (
            <div className="h-full flex items-center justify-center bg-red-50">
              <div className="text-center p-4">
                <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Map Error</p>
                <p className="text-sm text-gray-600 mt-1">{tokenError}</p>
              </div>
            </div>
          ) : office.address ? (
            <MapContainer
              ref={mapRef}
              mapboxToken={mapboxToken}
              phaAgencies={officeWithCoords ? [officeWithCoords] : [office]}
              onOfficeSelect={handleOfficeSelect}
              onTokenError={setTokenError}
              selectedOffice={officeWithCoords || office}
              selectedLocation={null}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No address available for mapping</p>
              </div>
            </div>
          )}
        </div>
        {tokenError && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{tokenError}</p>
          </div>
        )}
        {office.address && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <MapPin className="w-4 h-4" />
              <p className="text-sm font-medium">{office.address}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PHAMapSection;
