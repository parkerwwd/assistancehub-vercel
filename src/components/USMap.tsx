import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USLocation } from "@/data/locations";

// Simplified but realistic US state paths
const STATES = [
  { code: 'CA', name: 'California', path: 'M158 237L142 252L138 278L142 305L155 330L171 352L185 370L195 385L205 405L215 425L230 440L245 450L260 455L275 458L285 465L295 472L305 485L315 495L325 508L340 520L350 535L355 550L350 565L340 575L325 580L310 575L295 570L280 565L265 555L250 545L235 530L220 515L210 500L200 485L195 470L190 455L185 440L175 425L165 410L155 395L145 380L140 365L135 350L130 335L125 320L120 305L118 290L120 275L125 260L135 245L150 235Z' },
  { code: 'TX', name: 'Texas', path: 'M300 350L380 345L460 340L480 355L485 375L490 395L495 415L500 435L505 455L510 475L515 495L520 515L525 535L530 555L535 575L540 595L535 610L525 620L510 625L495 620L480 615L465 610L450 605L435 600L420 595L405 590L390 585L375 580L360 575L345 570L330 565L315 560L305 545L300 530L295 515L290 500L285 485L280 470L275 455L270 440L265 425L270 410L275 395L280 380L285 365L290 355Z' },
  { code: 'FL', name: 'Florida', path: 'M540 420L580 415L620 420L640 435L655 455L665 475L670 495L675 515L680 535L685 555L680 570L670 580L655 585L640 580L625 575L610 570L595 565L580 560L565 555L550 550L535 545L525 540L520 525L525 510L530 495L535 480L540 465L545 450L550 435Z' },
  { code: 'NY', name: 'New York', path: 'M680 180L720 175L750 180L770 195L775 215L770 235L760 250L745 260L725 265L705 260L685 255L675 240L670 225L675 210L680 195Z' },
  { code: 'PA', name: 'Pennsylvania', path: 'M650 220L720 215L740 230L735 250L720 265L700 270L680 265L660 260L650 245Z' },
  { code: 'IL', name: 'Illinois', path: 'M420 240L450 235L455 260L450 285L445 310L440 335L435 360L430 380L420 375L415 350L420 325L425 300L430 275L435 250Z' },
  { code: 'OH', name: 'Ohio', path: 'M520 240L560 235L565 260L560 285L555 310L550 330L540 335L530 330L525 305L530 280L535 255Z' },
  { code: 'GA', name: 'Georgia', path: 'M580 320L620 315L625 340L620 365L615 390L610 410L600 415L590 410L585 385L590 360L595 335Z' },
  { code: 'NC', name: 'North Carolina', path: 'M620 280L680 275L685 300L680 325L675 345L665 350L655 345L645 340L635 335L625 330L620 305Z' },
  { code: 'MI', name: 'Michigan', path: 'M480 200L520 195L525 220L520 245L515 270L505 275L495 270L485 245L480 220Z' },
  { code: 'NJ', name: 'New Jersey', path: 'M720 240L740 235L745 260L740 285L735 305L725 310L720 285L725 260Z' },
  { code: 'VA', name: 'Virginia', path: 'M620 260L680 255L685 280L680 305L675 325L665 330L655 325L645 320L635 315L625 310L620 285Z' },
  { code: 'WA', name: 'Washington', path: 'M120 80L200 75L205 100L200 125L195 150L185 155L175 150L165 125L160 100L155 80Z' },
  { code: 'AZ', name: 'Arizona', path: 'M200 320L260 315L265 340L260 365L255 390L250 415L240 420L230 415L225 390L230 365L235 340Z' },
  { code: 'MA', name: 'Massachusetts', path: 'M760 160L800 155L805 175L800 195L795 210L785 215L775 210L770 185Z' },
  { code: 'TN', name: 'Tennessee', path: 'M480 300L580 295L585 320L580 340L570 345L560 340L550 335L540 330L530 325L520 320L510 315L500 310L490 305Z' },
  { code: 'IN', name: 'Indiana', path: 'M460 240L500 235L505 260L500 285L495 310L485 315L475 310L470 285L475 260Z' },
  { code: 'MO', name: 'Missouri', path: 'M380 280L460 275L465 300L460 325L455 350L445 355L435 350L425 325L430 300L435 275Z' },
  { code: 'MD', name: 'Maryland', path: 'M680 240L720 235L725 255L720 275L715 290L705 295L695 290L690 265Z' },
  { code: 'WI', name: 'Wisconsin', path: 'M420 180L460 175L465 200L460 225L455 250L445 255L435 250L430 225L435 200Z' },
  { code: 'MN', name: 'Minnesota', path: 'M380 140L440 135L445 160L440 185L435 210L425 215L415 210L410 185L415 160Z' },
  { code: 'CO', name: 'Colorado', path: 'M280 260L360 255L365 280L360 305L355 330L345 335L335 330L325 305L330 280Z' },
  { code: 'AL', name: 'Alabama', path: 'M540 340L580 335L585 360L580 385L575 405L565 410L555 405L550 380L555 355Z' },
  { code: 'LA', name: 'Louisiana', path: 'M380 380L460 375L465 400L460 425L455 445L445 450L435 445L425 420L430 395Z' },
  { code: 'KY', name: 'Kentucky', path: 'M500 280L580 275L585 300L580 320L570 325L560 320L550 315L540 310L530 305L520 300Z' },
  { code: 'OR', name: 'Oregon', path: 'M120 120L200 115L205 140L200 165L195 185L185 190L175 185L165 160L160 135Z' },
  { code: 'OK', name: 'Oklahoma', path: 'M300 320L400 315L405 340L400 365L395 385L385 390L375 385L365 360L370 335Z' },
  { code: 'CT', name: 'Connecticut', path: 'M740 180L780 175L785 195L780 215L775 230L765 235L755 230L750 205Z' },
  { code: 'IA', name: 'Iowa', path: 'M380 220L460 215L465 240L460 265L455 285L445 290L435 285L430 260L435 235Z' },
  { code: 'MS', name: 'Mississippi', path: 'M500 360L540 355L545 380L540 405L535 425L525 430L515 425L510 400L515 375Z' },
  { code: 'AR', name: 'Arkansas', path: 'M420 340L480 335L485 360L480 385L475 405L465 410L455 405L450 380L455 355Z' },
  { code: 'KS', name: 'Kansas', path: 'M300 280L400 275L405 300L400 325L395 345L385 350L375 345L365 320L370 295Z' },
  { code: 'UT', name: 'Utah', path: 'M240 240L300 235L305 260L300 285L295 310L285 315L275 310L270 285L275 260Z' },
  { code: 'NV', name: 'Nevada', path: 'M180 240L240 235L245 260L240 285L235 310L225 315L215 310L210 285L215 260Z' },
  { code: 'NM', name: 'New Mexico', path: 'M240 320L300 315L305 340L300 365L295 390L285 395L275 390L270 365L275 340Z' },
  { code: 'WV', name: 'West Virginia', path: 'M620 240L660 235L665 260L660 285L655 305L645 310L635 305L630 280L635 255Z' },
  { code: 'NE', name: 'Nebraska', path: 'M300 240L400 235L405 260L400 285L395 305L385 310L375 305L365 280L370 255Z' },
  { code: 'ID', name: 'Idaho', path: 'M200 160L260 155L265 180L260 205L255 230L245 235L235 230L230 205L235 180Z' },
  { code: 'HI', name: 'Hawaii', path: 'M220 420L280 415L285 440L280 465L275 485L265 490L255 485L250 460L255 435Z' },
  { code: 'NH', name: 'New Hampshire', path: 'M740 140L760 135L765 160L760 185L755 205L745 210L740 185L745 160Z' },
  { code: 'ME', name: 'Maine', path: 'M760 100L800 95L805 120L800 145L795 170L785 175L775 170L770 145L775 120Z' },
  { code: 'RI', name: 'Rhode Island', path: 'M780 180L800 175L805 195L800 215L795 230L785 235L780 210L785 185Z' },
  { code: 'VT', name: 'Vermont', path: 'M720 140L740 135L745 160L740 185L735 205L725 210L720 185L725 160Z' },
  { code: 'AK', name: 'Alaska', path: 'M80 380L160 375L165 400L160 425L155 445L145 450L135 445L130 420L135 395Z' },
  { code: 'WY', name: 'Wyoming', path: 'M260 200L340 195L345 220L340 245L335 270L325 275L315 270L310 245L315 220Z' },
  { code: 'MT', name: 'Montana', path: 'M260 120L380 115L385 140L380 165L375 190L365 195L355 190L350 165L355 140Z' },
  { code: 'ND', name: 'North Dakota', path: 'M340 100L420 95L425 120L420 145L415 170L405 175L395 170L390 145L395 120Z' },
  { code: 'SD', name: 'South Dakota', path: 'M340 160L420 155L425 180L420 205L415 230L405 235L395 230L390 205L395 180Z' },
  { code: 'DE', name: 'Delaware', path: 'M720 260L740 255L745 275L740 295L735 310L725 315L720 290L725 270Z' },
  { code: 'SC', name: 'South Carolina', path: 'M620 320L660 315L665 340L660 365L655 385L645 390L635 385L630 360L635 335Z' },
  { code: 'DC', name: 'District of Columbia', path: 'M705 255L715 250L720 270L715 290L710 305L700 310L695 290L700 270Z' }
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
      <div className="relative w-full max-w-5xl aspect-[5/3] p-4">
        <svg
          viewBox="0 0 850 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="850" height="500" fill="#f8fafc" />
          
          {/* Title */}
          <text
            x="425"
            y="30"
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill="#1f2937"
          >
            Click on a state to view Section 8 housing options
          </text>
          
          {/* States */}
          {STATES.map((state) => (
            <g key={state.code}>
              <path
                d={state.path}
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
            </g>
          ))}
          
          {/* Tooltip */}
          {hoveredState && (
            <g>
              <rect
                x="20"
                y="50"
                width="200"
                height="40"
                fill="#1f2937"
                rx="6"
                opacity="0.95"
              />
              <text
                x="30"
                y="75"
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