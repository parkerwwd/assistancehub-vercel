import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usaMapSvg from '@/assets/usa-map.svg';

const SearchByStateSection = () => {
  const [selectedState, setSelectedState] = useState('');
  const [hoveredState, setHoveredState] = useState('');

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ];

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    // Navigate to Section 8 page with state filter
    window.location.href = `/section8?state=${encodeURIComponent(state)}`;
  };

  return (
    <section className="py-16  border-t">
      <div className="container mx-auto px-4 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Search Housing By State
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We have listings in every state. Click on a state to find Section 8 housing in your desired area.
          </p>
        </div>

        {/* State Selector */}
        <div className="mb-12">
          <Select onValueChange={handleStateSelect}>
            <SelectTrigger className="w-64 mx-auto bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* US Map */}
        <div className="relative max-w-5xl mx-auto">
          <img 
            src={usaMapSvg} 
            alt="Interactive US Map for Section 8 Housing Search" 
            className="w-full h-auto cursor-pointer"
            style={{ maxHeight: '500px' }}
            onClick={(e) => {
              // Handle clicks on the map - you can add specific state detection logic here
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              console.log('Map clicked at:', x, y);
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchByStateSection;