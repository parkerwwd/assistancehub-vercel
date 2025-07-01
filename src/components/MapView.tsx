
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PHAOffice } from "@/types/phaOffice";
import { phaOffices } from "@/data/phaOffices";
import { getWaitlistColor } from "@/utils/mapUtils";
import OfficeDetailsPanel from "./OfficeDetailsPanel";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("pk.eyJ1IjoicG9wb3ZpY2giLCJhIjoiY20zNjd0eG4wMDNmYjJrbjNiZTV2cXZrbCJ9.HLmhNPHJKKG2xBs3YVpCvw");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each PHA office
    phaOffices.forEach((office) => {
      const marker = new mapboxgl.Marker({
        color: getWaitlistColor(office.waitlistStatus)
      })
        .setLngLat(office.coordinates)
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        setSelectedOffice(office);
        map.current?.flyTo({
          center: office.coordinates,
          zoom: 12
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleSearch = () => {
    if (!map.current || !searchQuery.trim()) return;
    
    const office = phaOffices.find(office => 
      office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.address.split(',')[1]?.trim().toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (office) {
      setSelectedOffice(office);
      map.current.flyTo({
        center: office.coordinates,
        zoom: 12
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]">
      {/* Map Container - Takes up 3/4 of the width on large screens */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Search by city, state, or PHA name..."
                className="flex-1 border-blue-200 focus:border-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-[calc(100%-80px)]" />
        </div>
      </div>

      {/* Office Details Panel - Takes up 1/4 of the width on large screens */}
      <div className="lg:col-span-1">
        <OfficeDetailsPanel selectedOffice={selectedOffice} />
      </div>
    </div>
  );
};

export default MapView;
