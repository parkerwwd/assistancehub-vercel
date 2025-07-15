
import React from 'react';
import { Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USLocation } from "@/data/usLocations";
import UnifiedSearchInput from "./UnifiedSearchInput";

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
              <UnifiedSearchInput onLocationSelect={onCitySelect} autoNavigate={false} variant="compact" />
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
          
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
