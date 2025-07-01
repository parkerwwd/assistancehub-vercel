
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Key } from "lucide-react";
import { PHAOffice } from "@/types/phaOffice";
import { phaOffices } from "@/data/phaOffices";
import { getWaitlistColor } from "@/utils/mapUtils";
import OfficeDetailsPanel from "./OfficeDetailsPanel";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    // Clear any previous error
    setTokenError("");

    try {
      mapboxgl.accessToken = mapboxToken.trim();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error && 'status' in e.error && e.error.status === 401) {
          setTokenError("Invalid Mapbox token. Please check your token and try again.");
        } else {
          setTokenError("Error loading map. Please check your token and try again.");
        }
      });

      // Add markers for each PHA office
      map.current.on('load', () => {
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
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError("Error initializing map. Please check your token.");
    }
  }, [mapboxToken]);

  const handleSearch = () => {
    if (!map.current || !searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase().trim();
    console.log('Searching for:', query);
    
    const office = phaOffices.find(office => {
      const addressLower = office.address.toLowerCase();
      const nameLower = office.name.toLowerCase();
      
      // Extract city and state from address
      const addressParts = office.address.split(',');
      const city = addressParts[1]?.trim().toLowerCase() || '';
      const state = addressParts[2]?.trim().toLowerCase() || '';
      
      console.log('Checking office:', office.name, 'City:', city, 'State:', state);
      
      return (
        addressLower.includes(query) ||
        nameLower.includes(query) ||
        city.includes(query) ||
        state.includes(query)
      );
    });
    
    if (office) {
      console.log('Found office:', office.name);
      setSelectedOffice(office);
      map.current.flyTo({
        center: office.coordinates,
        zoom: 12
      });
    } else {
      console.log('No office found for query:', query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mapbox Token Input */}
      {!mapboxToken && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-2">Mapbox Token Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                To display the map, please enter your Mapbox public token. You can get one free at{' '}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">
                  mapbox.com
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your Mapbox public token (pk.)"
                  className="flex-1"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                />
              </div>
              {tokenError && (
                <p className="text-sm text-red-600 mt-2">{tokenError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {mapboxToken && (
        <div className="bg-white rounded-lg shadow-md p-4">
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
      )}

      {/* Main Content Grid */}
      {mapboxToken && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[70vh] min-h-[500px]">
              <div ref={mapContainer} className="w-full h-full" />
            </div>
          </div>

          {/* Office Details Panel */}
          <div className="xl:col-span-1">
            <OfficeDetailsPanel selectedOffice={selectedOffice} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
