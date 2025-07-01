
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Search, ExternalLink } from "lucide-react";

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
  const [mapboxToken, setMapboxToken] = useState("pk.eyJ1IjoicG9wb3ZpY2giLCJhIjoiY20zNjd0eG4wMDNmYjJrbjNiZTV2cXZrbCJ9.HLmhNPHJKKG2xBs3YVpCvw");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    },
    {
      id: 5,
      name: "Houston Housing Authority",
      address: "2640 Fountain View Dr, Houston, TX 77057",
      phone: "(713) 260-0300",
      website: "www.housingforhouston.com",
      waitlistStatus: "Open",
      coordinates: [-95.3698, 29.7604]
    },
    {
      id: 6,
      name: "Phoenix Housing Authority",
      address: "914 N 1st Ave, Phoenix, AZ 85003",
      phone: "(602) 262-6251",
      website: "www.phoenix.gov/pdd/housing",
      waitlistStatus: "Limited Opening",
      coordinates: [-112.0740, 33.4484]
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Container */}
      <div className="lg:col-span-2">
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

      {/* Office Details Panel */}
      <div className="lg:col-span-1">
        {selectedOffice ? (
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">{selectedOffice.name}</CardTitle>
              <CardDescription className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                {selectedOffice.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Waitlist Status:</span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getWaitlistColor(selectedOffice.waitlistStatus) + '20',
                    color: getWaitlistColor(selectedOffice.waitlistStatus)
                  }}
                >
                  {selectedOffice.waitlistStatus}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Phone className="w-4 h-4 mr-3 text-blue-600" />
                  <a 
                    href={`tel:${selectedOffice.phone}`}
                    className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
                  >
                    {selectedOffice.phone}
                  </a>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <ExternalLink className="w-4 h-4 mr-3 text-green-600" />
                  <a 
                    href={`https://${selectedOffice.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:text-green-800 font-medium transition-colors text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Available Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Section 8 Housing Choice Vouchers</li>
                  <li>• Public Housing Applications</li>
                  <li>• Housing Assistance Programs</li>
                  <li>• Rental Assistance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Find PHA Offices</CardTitle>
              <CardDescription className="text-gray-600">
                Click on a marker on the map or search above to view details about Public Housing Authority offices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Waitlist Status Legend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-gray-700">Open Waitlist</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                      <span className="text-gray-700">Limited Opening</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                      <span className="text-gray-700">Closed Waitlist</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Waitlist status can change frequently. Always contact the PHA directly for the most current information.
                  </p>
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
