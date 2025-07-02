
import { useState, useEffect, useRef } from 'react';
import { PHAOffice } from "@/types/phaOffice";
import { phaOffices } from "@/data/phaOffices";
import { USCity } from "@/data/usCities";
import { MapContainerRef } from "@/components/MapContainer";

export const useMapLogic = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<PHAOffice | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<MapContainerRef>(null);

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

  const handleCitySelect = (city: USCity) => {
    console.log('Selected city:', city.name, city.stateCode);
    
    // Fly to the selected city
    if (mapRef.current) {
      mapRef.current.flyTo([city.longitude, city.latitude], 10);
    }

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
    if (!query.trim()) return;
    
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
      if (mapRef.current) {
        mapRef.current.flyTo(office.coordinates, 12);
      }
    } else {
      console.log('No office found for query:', queryLower);
    }
  };

  return {
    mapboxToken,
    selectedOffice,
    tokenError,
    showFilters,
    mapRef,
    setSelectedOffice,
    setTokenError,
    setShowFilters,
    handleTokenChange,
    handleCitySelect,
    handleSearch
  };
};
