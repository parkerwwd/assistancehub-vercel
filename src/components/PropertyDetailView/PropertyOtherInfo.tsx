import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from '@/types/property';
import { Info, Building } from 'lucide-react';

interface PropertyOtherInfoProps {
  property: Property;
}

const PropertyOtherInfo: React.FC<PropertyOtherInfoProps> = ({ property }) => {
  // Validate year is reasonable
  const currentYear = new Date().getFullYear();
  const yearIsValid = property.year_put_in_service && 
                     property.year_put_in_service >= 1900 && 
                     property.year_put_in_service <= currentYear + 5;
  
  // Calculate total units from distribution
  const totalUnitsFromDistribution = 
    (property.units_studio || 0) + 
    (property.units_1br || 0) + 
    (property.units_2br || 0) + 
    (property.units_3br || 0) + 
    (property.units_4br || 0);

  const hasUnitDistribution = totalUnitsFromDistribution > 0;
  
  // Validate bedroom counts aren't years or other invalid values (common data error)
  const validateBedroomCount = (count: number | null | undefined): number => {
    if (!count) return 0;
    // If the count looks like a year, return 0
    if (count >= 1900 && count <= currentYear + 5) return 0;
    // If the count is unreasonably high (like 9999), return 0
    if (count > 500) return 0;  // No property realistically has 500+ units of one bedroom type
    return count;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Building className="w-5 h-5 text-amber-600" />
          Additional Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Year and Units Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Year Put into Service */}
          {property.year_put_in_service && yearIsValid && (
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">Year Put into Service</h3>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {property.year_put_in_service}
              </p>
            </div>
          )}
          
          {/* Low Income Units */}
          {property.low_income_units !== null && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">Low Income Units</h3>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {property.low_income_units}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Availability Not Guaranteed</p>
            </div>
          )}
        </div>
        
        {/* Unit Distribution - Mobile Responsive */}
        {hasUnitDistribution && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-4 text-center">Unit Distribution</h3>
            
            {/* Mobile: 2x3 grid, Desktop: 5 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-center">
              <div className="bg-white rounded p-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Studio</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_studio)}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">1 Bed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_1br)}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">2 Bed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_2br)}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">3 Bed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_3br)}
                </p>
              </div>
              <div className="bg-white rounded p-3 col-span-2 sm:col-span-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">4 Bed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_4br)}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center mt-3 sm:mt-4">Availability Not Guaranteed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOtherInfo; 