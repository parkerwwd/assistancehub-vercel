
import React from 'react';
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USCity } from "@/data/usCities";
import CitySearch from "./CitySearch";

interface MapFiltersProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onCitySelect: (city: USCity) => void;
  onSearch: (query: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  showFilters,
  onToggleFilters,
  onCitySelect,
  onSearch
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <CitySearch onCitySelect={onCitySelect} onSearch={onSearch} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>
      
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700">Filter by waitlist status:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Open</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Limited</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Closed</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
