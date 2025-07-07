import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { USLocation } from "@/data/locations";

// US TopoJSON file URL (React Simple Maps provides this)
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// State name mapping for proper display names
const stateNames: { [key: string]: string } = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
  '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
  '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
  '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
  '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan',
  '27': 'Minnesota', '28': 'Mississippi', '29': 'Missouri', '30': 'Montana',
  '31': 'Nebraska', '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey',
  '35': 'New Mexico', '36': 'New York', '37': 'North Carolina', '38': 'North Dakota',
  '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania',
  '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
  '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont',
  '51': 'Virginia', '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin',
  '56': 'Wyoming'
};

// State code mapping for navigation
const stateCodes: { [key: string]: string } = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY'
};

interface USMapProps {
  onStateClick?: (stateCode: string) => void;
  selectedState?: string;
}

const USMap: React.FC<USMapProps> = ({ onStateClick, selectedState }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStateClick = (geo: any) => {
    const stateId = geo.id;
    const stateCode = stateCodes[stateId];
    const stateName = stateNames[stateId];
    
    if (stateCode && stateName) {
      const stateLocation: USLocation = {
        name: stateName,
        stateCode: stateCode,
        state: stateName,
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

  const getStateFill = (geo: any) => {
    const stateCode = stateCodes[geo.id];
    
    if (selectedState === stateCode || hoveredState === geo.id) {
      return '#3B82F6'; // Blue for selected/hovered
    }
    return '#E5E7EB'; // Light gray for default
  };

  const getStateStroke = (geo: any) => {
    const stateCode = stateCodes[geo.id];
    
    if (selectedState === stateCode || hoveredState === geo.id) {
      return '#1D4ED8'; // Darker blue border for selected/hovered
    }
    return '#FFFFFF'; // White border for default
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg">
      {/* Header Section - Clean spacing */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Interactive US Map
        </h3>
        <p className="text-gray-600 text-sm">
          Click on a state to view Section 8 housing options
        </p>
      </div>
      
      {/* Map Container - Properly contained */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <ComposableMap 
            projection="geoAlbersUsa"
            style={{ width: '100%', height: 'auto' }}
            projectionConfig={{
              scale: 1000,
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateFill(geo)}
                    stroke={getStateStroke(geo)}
                    strokeWidth={hoveredState === geo.id ? 2 : 1}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      hover: {
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        outline: 'none',
                      },
                    }}
                    onClick={() => handleStateClick(geo)}
                    onMouseEnter={() => setHoveredState(geo.id)}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>
      
      {/* Hover State Info - Separated from map */}
      {hoveredState && (
        <div className="text-center mb-6 p-3 bg-white rounded-lg shadow-sm border border-blue-200 mx-auto max-w-md">
          <p className="text-lg font-medium text-blue-700">
            {stateNames[hoveredState]}
          </p>
          <p className="text-sm text-gray-600">
            Click to view housing authorities
          </p>
        </div>
      )}

      {/* Popular States Section - Clean separation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h4 className="text-center text-base font-medium text-gray-800 mb-4">
          Popular states to explore:
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          {['06', '48', '12', '36', '17', '13'].map((stateId) => {
            const stateCode = stateCodes[stateId];
            const stateName = stateNames[stateId];
            return (
              <button
                key={stateId}
                onClick={() => handleStateClick({ id: stateId })}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {stateName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default USMap; 