import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USLocation } from "@/data/locations";

// Simplified state data with approximate positions for a cleaner map
const STATES = [
  { code: 'AL', name: 'Alabama', x: 420, y: 320, width: 40, height: 60 },
  { code: 'AK', name: 'Alaska', x: 50, y: 400, width: 80, height: 50 },
  { code: 'AZ', name: 'Arizona', x: 150, y: 280, width: 60, height: 70 },
  { code: 'AR', name: 'Arkansas', x: 350, y: 290, width: 50, height: 50 },
  { code: 'CA', name: 'California', x: 50, y: 200, width: 80, height: 120 },
  { code: 'CO', name: 'Colorado', x: 250, y: 250, width: 60, height: 50 },
  { code: 'CT', name: 'Connecticut', x: 540, y: 180, width: 25, height: 20 },
  { code: 'DE', name: 'Delaware', x: 530, y: 210, width: 15, height: 25 },
  { code: 'FL', name: 'Florida', x: 460, y: 380, width: 80, height: 50 },
  { code: 'GA', name: 'Georgia', x: 450, y: 310, width: 40, height: 60 },
  { code: 'HI', name: 'Hawaii', x: 200, y: 400, width: 50, height: 30 },
  { code: 'ID', name: 'Idaho', x: 180, y: 150, width: 40, height: 80 },
  { code: 'IL', name: 'Illinois', x: 370, y: 220, width: 35, height: 70 },
  { code: 'IN', name: 'Indiana', x: 410, y: 220, width: 35, height: 60 },
  { code: 'IA', name: 'Iowa', x: 330, y: 210, width: 50, height: 40 },
  { code: 'KS', name: 'Kansas', x: 280, y: 250, width: 60, height: 40 },
  { code: 'KY', name: 'Kentucky', x: 420, y: 250, width: 70, height: 35 },
  { code: 'LA', name: 'Louisiana', x: 350, y: 350, width: 50, height: 40 },
  { code: 'ME', name: 'Maine', x: 560, y: 120, width: 30, height: 60 },
  { code: 'MD', name: 'Maryland', x: 510, y: 210, width: 40, height: 25 },
  { code: 'MA', name: 'Massachusetts', x: 540, y: 160, width: 40, height: 20 },
  { code: 'MI', name: 'Michigan', x: 410, y: 180, width: 50, height: 70 },
  { code: 'MN', name: 'Minnesota', x: 320, y: 150, width: 50, height: 70 },
  { code: 'MS', name: 'Mississippi', x: 380, y: 320, width: 35, height: 60 },
  { code: 'MO', name: 'Missouri', x: 320, y: 240, width: 60, height: 50 },
  { code: 'MT', name: 'Montana', x: 220, y: 120, width: 80, height: 50 },
  { code: 'NE', name: 'Nebraska', x: 280, y: 200, width: 60, height: 40 },
  { code: 'NV', name: 'Nevada', x: 120, y: 220, width: 50, height: 70 },
  { code: 'NH', name: 'New Hampshire', x: 550, y: 140, width: 25, height: 40 },
  { code: 'NJ', name: 'New Jersey', x: 530, y: 190, width: 25, height: 40 },
  { code: 'NM', name: 'New Mexico', x: 230, y: 300, width: 50, height: 60 },
  { code: 'NY', name: 'New York', x: 500, y: 150, width: 60, height: 50 },
  { code: 'NC', name: 'North Carolina', x: 480, y: 260, width: 70, height: 40 },
  { code: 'ND', name: 'North Dakota', x: 280, y: 120, width: 60, height: 40 },
  { code: 'OH', name: 'Ohio', x: 450, y: 200, width: 50, height: 60 },
  { code: 'OK', name: 'Oklahoma', x: 280, y: 290, width: 70, height: 40 },
  { code: 'OR', name: 'Oregon', x: 80, y: 150, width: 60, height: 50 },
  { code: 'PA', name: 'Pennsylvania', x: 480, y: 180, width: 70, height: 40 },
  { code: 'RI', name: 'Rhode Island', x: 565, y: 165, width: 15, height: 15 },
  { code: 'SC', name: 'South Carolina', x: 480, y: 300, width: 40, height: 40 },
  { code: 'SD', name: 'South Dakota', x: 280, y: 170, width: 60, height: 40 },
  { code: 'TN', name: 'Tennessee', x: 420, y: 280, width: 70, height: 30 },
  { code: 'TX', name: 'Texas', x: 250, y: 330, width: 90, height: 80 },
  { code: 'UT', name: 'Utah', x: 190, y: 220, width: 40, height: 60 },
  { code: 'VT', name: 'Vermont', x: 540, y: 140, width: 20, height: 40 },
  { code: 'VA', name: 'Virginia', x: 490, y: 230, width: 70, height: 30 },
  { code: 'WA', name: 'Washington', x: 80, y: 100, width: 70, height: 50 },
  { code: 'WV', name: 'West Virginia', x: 470, y: 220, width: 40, height: 50 },
  { code: 'WI', name: 'Wisconsin', x: 360, y: 160, width: 40, height: 60 },
  { code: 'WY', name: 'Wyoming', x: 220, y: 170, width: 60, height: 50 },
  { code: 'DC', name: 'District of Columbia', x: 525, y: 225, width: 8, height: 8 },
];

interface USMapProps {
  selectedState?: string;
  onStateClick?: (stateCode: string) => void;
  onStateHover?: (stateCode: string | null) => void;
}

const USMap: React.FC<USMapProps> = ({ selectedState, onStateClick, onStateHover }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStateClick = (stateCode: string) => {
    const state = STATES.find(s => s.code === stateCode);
    if (state) {
      const stateLocation: USLocation = {
        name: state.name,
        stateCode: state.code,
        state: state.name,
        type: 'state',
        latitude: 39.8283,
        longitude: -98.5795
      };
      
      if (onStateClick) {
        onStateClick(stateCode);
      }
      
      // Always navigate to search results after a brief delay
      setTimeout(() => {
        navigate('/section8', { state: { searchLocation: stateLocation } });
      }, 500);
    }
  };

  const handleStateHover = (stateCode: string | null) => {
    setHoveredState(stateCode);
    if (onStateHover) {
      onStateHover(stateCode);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
      <div className="relative w-full max-w-4xl aspect-[3/2] p-4">
        <svg
          viewBox="0 0 650 450"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="650" height="450" fill="#f8fafc" />
          
          {/* Title */}
          <text
            x="325"
            y="30"
            textAnchor="middle"
            fontSize="20"
            fontWeight="600"
            fill="#1f2937"
          >
            Click on a state to view Section 8 housing options
          </text>
          
          {/* States */}
          {STATES.map((state) => (
            <g key={state.code}>
              <rect
                x={state.x}
                y={state.y}
                width={state.width}
                height={state.height}
                rx="3"
                fill={
                  selectedState === state.code 
                    ? "#3b82f6"
                    : hoveredState === state.code 
                    ? "#60a5fa" 
                    : "#e2e8f0"
                }
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:drop-shadow-lg"
                onClick={() => handleStateClick(state.code)}
                onMouseEnter={() => handleStateHover(state.code)}
                onMouseLeave={() => handleStateHover(null)}
              />
              
              {/* State abbreviation */}
              <text
                x={state.x + state.width / 2}
                y={state.y + state.height / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill={
                  selectedState === state.code || hoveredState === state.code
                    ? "white" 
                    : "#374151"
                }
                className="pointer-events-none select-none"
              >
                {state.code}
              </text>
            </g>
          ))}
          
          {/* Tooltip */}
          {hoveredState && (
            <g>
              <rect
                x="20"
                y="20"
                width="200"
                height="40"
                fill="#1f2937"
                rx="6"
                opacity="0.95"
              />
              <text
                x="30"
                y="45"
                fill="white"
                fontSize="16"
                fontWeight="500"
              >
                {STATES.find(s => s.code === hoveredState)?.name}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default USMap; 