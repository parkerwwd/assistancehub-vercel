import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Key, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PHAOffice } from "@/types/phaOffice";
import { phaOffices } from "@/data/phaOffices";
import { getWaitlistColor } from "@/utils/mapUtils";
import { USCity } from "@/data/usCities";
import OfficeDetailsPanel from "./OfficeDetailsPanel";
import CitySearch from "./CitySearch";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  // Save token to localStorage whenever it changes
  const handleTokenChange = (token: string) => {
    setMapboxToken(token);
    if (token.trim()) {
      localStorage.setItem('mapbox-token', token.trim());
    } else {
      localStorage.removeItem('mapbox-token');
    }
  };

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

  const handleCitySelect = (city: USCity) => {
    if (!map.current) return;
    
    console.log('Selected city:', city.name, city.stateCode);
    
    // Fly to the selected city
    map.current.flyTo({
      center: [city.longitude, city.latitude],
      zoom: 10
    });

    // Look for nearby PHA offices
    const nearbyOffice = phaOffices.find(office => {
      const addressLower = office.address.toLowerCase();
      const cityLower = city.name.toLowerCase();
      const stateLower = city.state.toLowerCase();
      
      return addressLower.includes(cityLower) || addressLower.includes(stateLower);
    });

    if (nearbyOffice) {
      setSelectedOffice(nearbyOffice);
      console.log('Found nearby PHA office:', nearbyOffice.name);
    }
  };

  const handleSearch = (query: string) => {
    if (!map.current || !query.trim()) return;
    
    const queryLower = query.toLowerCase().trim();
    console.log('Searching for:', queryLower);
    
    const office = phaOffices.find(office => {
      const addressLower = office.address.toLowerCase();
      const nameLower = office.name.toLowerCase();
      
      // Extract city and state from address
      const addressParts = office.address.split(',');
      const city = addressParts[1]?.trim().toLowerCase() || '';
      const state = addressParts[2]?.trim().toLowerCase() || '';
      
      return (
        addressLower.includes(queryLower) ||
        nameLower.includes(queryLower) ||
        city.includes(queryLower) ||
        state.includes(queryLower)
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
      console.log('No office found for query:', queryLower);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mapbox Token Input */}
      {!mapboxToken && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700 mb-3">
                Enter your Mapbox token to display the map. Get one free at{' '}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  mapbox.com
                </a>
              </p>
              <input
                type="text"
                placeholder="Enter Mapbox token (pk.)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={mapboxToken}
                onChange={(e) => handleTokenChange(e.target.value)}
              />
              {tokenError && (
                <p className="text-xs text-red-600 mt-2">{tokenError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {mapboxToken && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <CitySearch onCitySelect={handleCitySelect} onSearch={handleSearch} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-gray-700">Filter by waitlist status:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Open</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Limited</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Resizable Side-by-Side Layout */}
      {mapboxToken && (
        <div className="flex-1">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Map Panel */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full">
                <div ref={mapContainer} className="w-full h-full" />
              </div>
            </ResizablePanel>
            
            {/* Resize Handle */}
            <ResizableHandle withHandle />
            
            {/* Details Panel */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full pl-4">
                <OfficeDetailsPanel selectedOffice={selectedOffice} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default MapView;
