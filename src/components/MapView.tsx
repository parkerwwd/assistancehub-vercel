
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Search } from "lucide-react";

interface PHAOffice {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  waitlistStatus: string;
  coordinates: [number, number]; // [lng, lat]
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);

  // Mock data with coordinates
  const phaOffices: PHAOffice[] = [
    {
      id: 1,
      name: "Los Angeles Housing Authority",
      address: "2600 Wilshire Blvd, Los Angeles, CA 90057",
      phone: "(213) 252-2500",
      website: "www.hacla.org",
      waitlistStatus: "Closed",
      coordinates: [-118.2871, 34.0628]
    },
    {
      id: 2,
      name: "New York City Housing Authority",
      address: "250 Broadway, New York, NY 10007",
      phone: "(212) 306-3000",
      website: "www.nyc.gov/nycha",
      waitlistStatus: "Limited Opening",
      coordinates: [-74.0070, 40.7128]
    },
    {
      id: 3,
      name: "Chicago Housing Authority",
      address: "60 E Van Buren St, Chicago, IL 60605",
      phone: "(312) 742-8500",
      website: "www.thecha.org",
      waitlistStatus: "Open",
      coordinates: [-87.6244, 41.8781]
    },
    {
      id: 4,
      name: "Miami-Dade Public Housing Authority",
      address: "701 NW 1st Ct, Miami, FL 33136",
      phone: "(305) 375-1313",
      website: "www.miamidade.gov/housing",
      waitlistStatus: "Closed",
      coordinates: [-80.1918, 25.7617]
    }
  ];

  const getWaitlistColor = (status: string) => {
    switch (status) {
      case "Open": return "#10b981";
      case "Limited Opening": return "#f59e0b";
      case "Closed": return "#ef4444";
      default: return "#6b7280";
    }
  };

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

  const handleSearch = (location: string) => {
    if (!map.current || !location) return;
    
    // Simple search - in a real app, you'd use geocoding
    const office = phaOffices.find(office => 
      office.address.toLowerCase().includes(location.toLowerCase()) ||
      office.name.toLowerCase().includes(location.toLowerCase())
    );
    
    if (office) {
      setSelectedOffice(office);
      map.current.flyTo({
        center: office.coordinates,
        zoom: 12
      });
    }
  };

  if (!mapboxToken) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Map Configuration Required</h3>
        <p className="text-gray-600 mb-4">
          To use the map functionality, please enter your Mapbox public token. You can get one from{' '}
          <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            mapbox.com
          </a>
        </p>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter your Mapbox public token..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setMapboxToken(mapboxToken)}>
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Container */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search by city, state, or PHA name..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Search by city"]') as HTMLInputElement;
                  if (input) handleSearch(input.value);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-[calc(100%-80px)]" />
        </div>
      </div>

      {/* Selected Office Details */}
      <div className="lg:col-span-1">
        {selectedOffice ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{selectedOffice.name}</CardTitle>
              <CardDescription className="flex items-start">
                <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                {selectedOffice.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Waitlist Status:</span>
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getWaitlistColor(selectedOffice.waitlistStatus) + '20',
                    color: getWaitlistColor(selectedOffice.waitlistStatus)
                  }}
                >
                  {selectedOffice.waitlistStatus}
                </span>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <a 
                  href={`tel:${selectedOffice.phone}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {selectedOffice.phone}
                </a>
              </div>
              
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-gray-500" />
                <a 
                  href={`https://${selectedOffice.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                >
                  {selectedOffice.website}
                </a>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Services:</strong> Section 8 Housing Choice Vouchers, Public Housing, Housing Applications
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Select a PHA Office</CardTitle>
              <CardDescription>
                Click on a marker on the map to view details about that Public Housing Authority office.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Open Waitlist</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Limited Opening</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Closed Waitlist</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapView;
