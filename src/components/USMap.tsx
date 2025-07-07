import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USLocation } from "@/data/locations";

// Realistic US state SVG paths that actually look like the United States
const STATES = [
  {
    code: 'AL',
    name: 'Alabama',
    path: 'M647,393l5,52l-2,15l-18,12l-25,0l-15,-12l-8,-25l3,-42z'
  },
  {
    code: 'AK',
    name: 'Alaska',
    path: 'M158,458l60,0l15,35l-8,22l-45,8l-30,-15l8,-50z'
  },
  {
    code: 'AZ',
    name: 'Arizona',
    path: 'M207,298l82,0l12,88l-12,52l-82,0l0,-140z'
  },
  {
    code: 'AR',
    name: 'Arkansas',
    path: 'M526,311l68,0l8,35l-8,42l-68,0l0,-77z'
  },
  {
    code: 'CA',
    name: 'California',
    path: 'M87,225l55,8l35,45l-8,88l-25,72l-45,25l-25,-8l8,-115l-15,-85l20,-30z'
  },
  {
    code: 'CO',
    name: 'Colorado',
    path: 'M380,280l88,0l0,70l-88,0l0,-70z'
  },
  {
    code: 'CT',
    name: 'Connecticut',
    path: 'M785,205l35,0l8,25l-35,8l-8,-33z'
  },
  {
    code: 'DE',
    name: 'Delaware',
    path: 'M765,240l15,0l8,35l-15,8l-8,-43z'
  },
  {
    code: 'FL',
    name: 'Florida',
    path: 'M647,445l45,0l25,35l35,45l-25,35l-55,-8l-25,-52l0,-55z'
  },
  {
    code: 'GA',
    name: 'Georgia',
    path: 'M647,345l52,0l15,48l-15,52l-52,0l0,-100z'
  },
  {
    code: 'HI',
    name: 'Hawaii',
    path: 'M230,458l45,0l0,25l-45,0l0,-25z'
  },
  {
    code: 'ID',
    name: 'Idaho',
    path: 'M289,140l45,8l25,45l-8,87l-45,8l-17,-148z'
  },
  {
    code: 'IL',
    name: 'Illinois',
    path: 'M570,225l25,8l15,88l-15,55l-25,8l0,-159z'
  },
  {
    code: 'IN',
    name: 'Indiana',
    path: 'M595,225l35,0l8,88l-8,55l-35,0l0,-143z'
  },
  {
    code: 'IA',
    name: 'Iowa',
    path: 'M495,225l75,0l0,70l-75,0l0,-70z'
  },
  {
    code: 'KS',
    name: 'Kansas',
    path: 'M410,311l85,0l0,52l-85,0l0,-52z'
  },
  {
    code: 'KY',
    name: 'Kentucky',
    path: 'M595,295l88,0l15,35l-88,15l-15,-50z'
  },
  {
    code: 'LA',
    name: 'Louisiana',
    path: 'M495,393l68,0l15,45l-25,25l-58,-8l0,-62z'
  },
  {
    code: 'ME',
    name: 'Maine',
    path: 'M795,125l25,8l8,72l-25,8l-8,-88z'
  },
  {
    code: 'MD',
    name: 'Maryland',
    path: 'M720,255l45,0l8,25l-45,8l-8,-33z'
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    path: 'M785,180l35,0l8,25l-35,8l-8,-33z'
  },
  {
    code: 'MI',
    name: 'Michigan',
    path: 'M595,155l45,25l15,45l-15,45l-45,-25l0,-90z'
  },
  {
    code: 'MN',
    name: 'Minnesota',
    path: 'M495,140l75,8l0,77l-75,0l0,-85z'
  },
  {
    code: 'MS',
    name: 'Mississippi',
    path: 'M563,345l35,0l8,70l-35,8l-8,-78z'
  },
  {
    code: 'MO',
    name: 'Missouri',
    path: 'M495,295l75,0l8,48l-75,8l-8,-56z'
  },
  {
    code: 'MT',
    name: 'Montana',
    path: 'M334,140l136,0l0,85l-136,0l0,-85z'
  },
  {
    code: 'NE',
    name: 'Nebraska',
    path: 'M410,225l85,0l0,56l-85,0l0,-56z'
  },
  {
    code: 'NV',
    name: 'Nevada',
    path: 'M242,225l47,0l0,115l-47,0l0,-115z'
  },
  {
    code: 'NH',
    name: 'New Hampshire',
    path: 'M775,155l20,0l8,50l-20,8l-8,-58z'
  },
  {
    code: 'NJ',
    name: 'New Jersey',
    path: 'M755,225l25,0l8,50l-25,8l-8,-58z'
  },
  {
    code: 'NM',
    name: 'New Mexico',
    path: 'M334,350l76,0l0,88l-76,0l0,-88z'
  },
  {
    code: 'NY',
    name: 'New York',
    path: 'M720,155l55,8l15,42l-55,15l-15,-65z'
  },
  {
    code: 'NC',
    name: 'North Carolina',
    path: 'M683,295l82,0l15,35l-82,15l-15,-50z'
  },
  {
    code: 'ND',
    name: 'North Dakota',
    path: 'M410,140l85,0l0,56l-85,0l0,-56z'
  },
  {
    code: 'OH',
    name: 'Ohio',
    path: 'M630,225l65,0l15,70l-65,15l-15,-85z'
  },
  {
    code: 'OK',
    name: 'Oklahoma',
    path: 'M410,350l116,0l8,35l-116,8l-8,-43z'
  },
  {
    code: 'OR',
    name: 'Oregon',
    path: 'M157,225l85,8l0,70l-85,-8l0,-70z'
  },
  {
    code: 'PA',
    name: 'Pennsylvania',
    path: 'M695,205l70,0l15,50l-70,15l-15,-65z'
  },
  {
    code: 'RI',
    name: 'Rhode Island',
    path: 'M795,205l15,0l8,15l-15,8l-8,-23z'
  },
  {
    code: 'SC',
    name: 'South Carolina',
    path: 'M683,330l52,0l15,35l-52,15l-15,-50z'
  },
  {
    code: 'SD',
    name: 'South Dakota',
    path: 'M410,196l85,0l0,56l-85,0l0,-56z'
  },
  {
    code: 'TN',
    name: 'Tennessee',
    path: 'M563,311l120,0l15,34l-120,15l-15,-49z'
  },
  {
    code: 'TX',
    name: 'Texas',
    path: 'M334,350l76,0l0,88l25,45l-25,35l-76,-35l0,-133z'
  },
  {
    code: 'UT',
    name: 'Utah',
    path: 'M289,280l45,0l0,70l-45,0l0,-70z'
  },
  {
    code: 'VT',
    name: 'Vermont',
    path: 'M765,155l20,0l8,50l-20,8l-8,-58z'
  },
  {
    code: 'VA',
    name: 'Virginia',
    path: 'M695,270l70,0l15,25l-70,15l-15,-40z'
  },
  {
    code: 'WA',
    name: 'Washington',
    path: 'M157,140l132,8l0,77l-132,-8l0,-77z'
  },
  {
    code: 'WV',
    name: 'West Virginia',
    path: 'M695,240l50,0l15,30l-50,15l-15,-45z'
  },
  {
    code: 'WI',
    name: 'Wisconsin',
    path: 'M540,155l55,8l8,70l-55,8l-8,-86z'
  },
  {
    code: 'WY',
    name: 'Wyoming',
    path: 'M334,225l76,0l0,55l-76,0l0,-55z'
  },
  {
    code: 'DC',
    name: 'District of Columbia',
    path: 'M748,268l8,0l0,8l-8,0l0,-8z'
  }
];

interface USMapProps {
  onStateClick?: (stateCode: string) => void;
  selectedState?: string;
}

const USMap: React.FC<USMapProps> = ({ onStateClick, selectedState }) => {
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
      } else {
        navigate('/section8', { state: { searchLocation: stateLocation } });
      }
    }
  };

  const getStateFill = (stateCode: string) => {
    if (selectedState === stateCode || hoveredState === stateCode) {
      return '#3B82F6'; // Blue for selected/hovered
    }
    return '#E5E7EB'; // Light gray for default
  };

  const getStateStroke = (stateCode: string) => {
    if (selectedState === stateCode || hoveredState === stateCode) {
      return '#1D4ED8'; // Darker blue border for selected/hovered
    }
    return '#FFFFFF'; // White border for default
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Interactive US Map
        </h3>
        <p className="text-gray-600 text-sm">
          Click on a state to view Section 8 housing options
        </p>
      </div>
      
      <div className="flex justify-center">
        <svg
          viewBox="0 0 900 500"
          className="w-full max-w-4xl h-auto border border-gray-200 rounded-lg bg-white shadow-sm"
          style={{ aspectRatio: '900/500' }}
        >
          {STATES.map((state) => (
            <g key={state.code}>
              <path
                d={state.path}
                fill={getStateFill(state.code)}
                stroke={getStateStroke(state.code)}
                strokeWidth={selectedState === state.code || hoveredState === state.code ? "2" : "1"}
                className="transition-all duration-200 cursor-pointer hover:drop-shadow-md"
                onClick={() => handleStateClick(state.code)}
                onMouseEnter={() => setHoveredState(state.code)}
                onMouseLeave={() => setHoveredState(null)}
              />
              {/* State abbreviation labels - only show on larger states or when hovered */}
              {(state.code === 'CA' || state.code === 'TX' || state.code === 'FL' || 
                state.code === 'NY' || state.code === 'PA' || state.code === 'IL' ||
                state.code === 'OH' || state.code === 'MI' || state.code === 'GA' ||
                hoveredState === state.code) && (
                <text
                  x={state.path.includes('l') ? 
                    state.path.split('l')[0].split(',').slice(-2)[0] :
                    state.path.split(',')[0].replace('M', '')
                  }
                  y={state.path.includes('l') ? 
                    state.path.split('l')[0].split(',').slice(-1)[0] :
                    state.path.split(',')[1]
                  }
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="600"
                  fill={selectedState === state.code || hoveredState === state.code ? '#FFFFFF' : '#374151'}
                  pointerEvents="none"
                  className="select-none"
                >
                  {state.code}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {hoveredState && (
        <div className="text-center mt-4 p-3 bg-white rounded-lg shadow-sm border border-blue-200">
          <p className="text-lg font-medium text-blue-700">
            {STATES.find(s => s.code === hoveredState)?.name}
          </p>
          <p className="text-sm text-gray-600">
            Click to view housing authorities
          </p>
        </div>
      )}
    </div>
  );
};

export default USMap; 