
import React from 'react';
import { Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USLocation } from "@/data/usLocations";
import CitySearch from "./CitySearch";

interface MapFiltersProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onCitySelect: (location: USLocation) => void;
  searchInAreaEnabled?: boolean;
  onToggleSearchInArea?: (enabled: boolean) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  showFilters,
  onToggleFilters,
  onCitySelect,
  searchInAreaEnabled = false,
  onToggleSearchInArea
}) => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <CitySearch onCitySelect={onCitySelect} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 border-blue-500 flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
          
          {/* Search in Area Toggle */}
          {onToggleSearchInArea && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchInAreaEnabled}
                  onChange={(e) => onToggleSearchInArea(e.target.checked)}
                  className="rounded border-gray-300 w-4 h-4"
                />
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Search only in visible map area
                </span>
              </label>
              {searchInAreaEnabled && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Results will be filtered to the current map view
                </p>
              )}
            </div>
          )}
          
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 flex-shrink-0">Filter by waitlist status:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 w-3 h-3" />
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">Open</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 w-3 h-3" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-700">Limited</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 w-3 h-3" />
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">Closed</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
