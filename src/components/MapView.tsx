import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Key } from "lucide-react";
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
                <input
                  type="text"
                  placeholder="Enter your Mapbox public token (pk.)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={mapboxToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                />
              </div>
              {tokenError && (
                <p className="text-sm text-red-600 mt-2">{tokenError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      {mapboxToken && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <CitySearch onCitySelect={handleCitySelect} onSearch={handleSearch} />
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
