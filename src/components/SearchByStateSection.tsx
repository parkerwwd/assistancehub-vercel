import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-orange-50">
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
          <svg 
            viewBox="0 0 1000 600" 
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          >
            {/* US Map Background */}
            <rect width="1000" height="600" fill="#FDE68A" />
            
            {/* Simplified US Map Shape */}
            <path
              d="M 200 200 L 800 200 L 850 250 L 850 400 L 800 450 L 200 450 L 150 400 L 150 250 Z"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            
            {/* Alaska */}
            <rect x="80" y="380" width="60" height="40" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            
            {/* Hawaii */}
            <circle cx="180" cy="420" r="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="170" cy="430" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="160" cy="440" r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />

            {/* State Markers */}
            {/* West Coast */}
            <circle cx="180" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('California')} />
            <circle cx="190" cy="240" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Oregon')} />
            <circle cx="200" cy="220" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Washington')} />
            
            {/* Mountain West */}
            <circle cx="250" cy="270" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Nevada')} />
            <circle cx="280" cy="250" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Idaho')} />
            <circle cx="300" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Utah')} />
            <circle cx="320" cy="300" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Colorado')} />
            <circle cx="280" cy="320" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Arizona')} />
            <circle cx="330" cy="350" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('New Mexico')} />
            
            {/* Central States */}
            <circle cx="380" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Wyoming')} />
            <circle cx="420" cy="320" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Kansas')} />
            <circle cx="450" cy="340" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Oklahoma')} />
            <circle cx="400" cy="380" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Texas')} />
            
            {/* Midwest */}
            <circle cx="480" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Nebraska')} />
            <circle cx="520" cy="270" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Iowa')} />
            <circle cx="510" cy="320" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Missouri')} />
            <circle cx="500" cy="240" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('South Dakota')} />
            <circle cx="480" cy="220" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('North Dakota')} />
            <circle cx="540" cy="250" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Minnesota')} />
            <circle cx="580" cy="240" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Wisconsin')} />
            <circle cx="600" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Illinois')} />
            <circle cx="620" cy="270" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Indiana')} />
            <circle cx="630" cy="290" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Ohio')} />
            <circle cx="620" cy="250" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Michigan')} />
            
            {/* South */}
            <circle cx="530" cy="350" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Arkansas')} />
            <circle cx="570" cy="380" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Louisiana')} />
            <circle cx="550" cy="370" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Mississippi')} />
            <circle cx="600" cy="360" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Alabama')} />
            <circle cx="620" cy="340" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Tennessee')} />
            <circle cx="650" cy="320" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Kentucky')} />
            <circle cx="680" cy="350" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Georgia')} />
            <circle cx="720" cy="380" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Florida')} />
            <circle cx="690" cy="330" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('South Carolina')} />
            <circle cx="700" cy="310" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('North Carolina')} />
            
            {/* East Coast */}
            <circle cx="720" cy="290" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Virginia')} />
            <circle cx="750" cy="280" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Maryland')} />
            <circle cx="760" cy="270" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Delaware')} />
            <circle cx="750" cy="260" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Pennsylvania')} />
            <circle cx="780" cy="250" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('New Jersey')} />
            <circle cx="790" cy="240" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('New York')} />
            <circle cx="800" cy="230" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Connecticut')} />
            <circle cx="810" cy="220" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Massachusetts')} />
            <circle cx="780" cy="210" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Vermont')} />
            <circle cx="790" cy="200" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('New Hampshire')} />
            <circle cx="800" cy="190" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Maine')} />
            <circle cx="820" cy="215" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Rhode Island')} />
            
            {/* Special highlight for Iowa (as shown in the reference image) */}
            <circle cx="520" cy="270" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" className="cursor-pointer" onClick={() => handleStateSelect('Iowa')} />
            
            {/* Alaska marker */}
            <circle cx="110" cy="400" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Alaska')} />
            
            {/* Hawaii marker */}
            <circle cx="170" cy="430" r="5" fill="#374151" className="cursor-pointer hover:fill-red-600" onClick={() => handleStateSelect('Hawaii')} />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default SearchByStateSection;