import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from '@/types/property';
import { Info } from 'lucide-react';

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
  
  // Validate bedroom counts aren't years (common data error)
  const validateBedroomCount = (count: number | null | undefined): number => {
    if (!count) return 0;
    // If the count looks like a year, return 0
    if (count >= 1900 && count <= currentYear + 5) return 0;
    return count;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Info className="w-5 h-5 text-amber-600" />
          Other Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Two columns for Year and Low Income Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Put into Service */}
          <div className="bg-amber-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Year Put into Service</h3>
            <p className="text-4xl font-bold text-gray-900">
              {yearIsValid ? property.year_put_in_service : 'N/A'}
            </p>
          </div>
          
          {/* Low Income Units */}
          <div className="bg-amber-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Low Income Units</h3>
            <p className="text-4xl font-bold text-gray-900">
              {property.low_income_units ?? 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Availability Not Guaranteed</p>
          </div>
        </div>

        {/* Unit Distribution */}
        {hasUnitDistribution && (
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Unit Distribution</h3>
            
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Studio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_studio)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">1 Bed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_1br)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">2 Bed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_2br)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">3 Bed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_3br)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">4 Bed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {validateBedroomCount(property.units_4br)}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 text-center mt-4">Availability Not Guaranteed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyOtherInfo; 