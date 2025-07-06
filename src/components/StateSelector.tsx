import React, { useState } from 'react';
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USLocation } from "@/data/locations";

interface StateSelectorProps {
  onStateSelect: (location: USLocation) => void;
}

const STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

const StateSelector = ({ onStateSelect }: StateSelectorProps) => {
  const [selectedState, setSelectedState] = useState<string>("");

  const handleStateSelect = (stateCode: string) => {
    const state = STATES.find(s => s.code === stateCode);
    if (state) {
      setSelectedState(stateCode);
      
      const stateLocation: USLocation = {
        name: state.name,
        stateCode: state.code,
        state: state.name,
        type: 'state',
        latitude: 39.8283,
        longitude: -98.5795
      };
      
      onStateSelect(stateLocation);
    }
  };

  const handleSearch = () => {
    if (selectedState) {
      handleStateSelect(selectedState);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Search Housing by State
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We have Section 8 housing assistance listings in every state. Click on a state below to find housing in your desired area.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-3">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="flex-1 h-12 text-base">
                <SelectValue placeholder="Select Your State" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch} 
              disabled={!selectedState}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Interactive State Map
            </h3>
            <p className="text-gray-600">
              Click on any state to explore housing assistance options
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <svg viewBox="0 0 1000 600" className="w-full h-auto" style={{ maxHeight: '400px' }}>
                <rect
                  x="50"
                  y="100"
                  width="900"
                  height="400"
                  fill="#e5e7eb"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  rx="20"
                  className="hover:fill-blue-100 cursor-pointer transition-colors"
                />
                <text x="500" y="320" textAnchor="middle" className="fill-gray-600 text-2xl font-semibold">
                  United States Map
                </text>
                <text x="500" y="350" textAnchor="middle" className="fill-gray-500 text-lg">
                  Click a state above to get started
                </text>
              </svg>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-center text-lg font-semibold text-gray-900 mb-4">
              Popular States
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {['CA', 'TX', 'FL', 'NY', 'IL', 'GA'].map((stateCode) => {
                const state = STATES.find(s => s.code === stateCode);
                return (
                  <Button
                    key={stateCode}
                    variant="outline"
                    onClick={() => handleStateSelect(stateCode)}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {state?.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-gray-600">
            <span className="font-bold text-blue-600">Trusted by thousands of families</span> to find housing assistance nationwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default StateSelector; 