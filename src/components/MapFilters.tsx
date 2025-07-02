
import React from 'react';
import { Filter, Search } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <div className="pl-10">
                <CitySearch onCitySelect={onCitySelect} onSearch={onSearch} />
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-gray-700">Filter by waitlist status:</span>
              <div className="flex items-center gap-3">
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
  );
};

export default MapFilters;
