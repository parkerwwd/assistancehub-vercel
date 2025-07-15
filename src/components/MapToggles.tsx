import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Building2, Home } from 'lucide-react';
import { useSearchMap } from '@/contexts/SearchMapContext';

export const MapToggles: React.FC = () => {
  const { state, actions } = useSearchMap();
  
  const phaCount = state.showPHAs ? state.filteredAgencies.length : 0;
  const propertyCount = state.showProperties ? state.filteredProperties.length : 0;
  
  console.log('🎚️ MapToggles render:', {
    showPHAs: state.showPHAs,
    showProperties: state.showProperties,
    phaCount,
    propertyCount,
    filteredAgencies: state.filteredAgencies.length,
    filteredProperties: state.filteredProperties.length
  });
  
  const handlePropertiesToggle = (checked: boolean) => {
    console.log('🔄 Properties toggle clicked:', checked);
    actions.setShowProperties(checked);
  };
  
  const handlePHAsToggle = (checked: boolean) => {
    console.log('🔄 PHAs toggle clicked:', checked);
    actions.setShowPHAs(checked);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Show on Map</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-properties"
          checked={state.showProperties}
          onCheckedChange={handlePropertiesToggle}
          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
        />
        <Label 
          htmlFor="show-properties" 
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Home className="h-4 w-4 text-red-600" />
          <span>Properties</span>
          <span className="text-sm text-gray-500">({propertyCount.toLocaleString()})</span>
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-phas"
          checked={state.showPHAs}
          onCheckedChange={handlePHAsToggle}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <Label 
          htmlFor="show-phas" 
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Building2 className="h-4 w-4 text-blue-600" />
          <span>PHAs</span>
          <span className="text-sm text-gray-500">({phaCount.toLocaleString()})</span>
        </Label>
      </div>
      
      {state.showProperties && state.filteredProperties.length === 0 && state.allProperties.length === 0 && (
        <p className="text-xs text-gray-500 italic mt-2">
          No properties available yet. Property data is coming soon!
        </p>
      )}
    </div>
  );
};
