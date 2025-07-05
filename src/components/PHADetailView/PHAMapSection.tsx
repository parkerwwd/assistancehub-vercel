
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import MapContainer, { MapContainerRef } from "@/components/MapContainer";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAMapSectionProps {
  office: PHAAgency;
}

const PHAMapSection: React.FC<PHAMapSectionProps> = ({ office }) => {
  const mapRef = useRef<MapContainerRef>(null);
  const [tokenError, setTokenError] = useState("");
  const mapboxToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";

  const handleOfficeSelect = (selectedOffice: PHAAgency) => {
    console.log('Office selected on detail map:', selectedOffice.name);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Map className="w-5 h-5 text-blue-600" />
          Office Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 w-full relative">
          {office.address ? (
            <MapContainer
              ref={mapRef}
              mapboxToken={mapboxToken}
              phaAgencies={[office]}
              onOfficeSelect={handleOfficeSelect}
              onTokenError={setTokenError}
              selectedOffice={office}
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
      </CardContent>
    </Card>
  );
};

export default PHAMapSection;
