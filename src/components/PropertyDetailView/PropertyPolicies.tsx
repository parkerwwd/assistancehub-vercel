import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Dog, Cigarette, CheckCircle, XCircle } from "lucide-react";

interface PropertyPoliciesProps {
  property: Property;
}

const PropertyPolicies: React.FC<PropertyPoliciesProps> = ({ property }) => {
  const hasPolicies = property.pet_policy || property.smoking_policy;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5 text-orange-600" />
          Policies
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {hasPolicies ? (
          <div className="space-y-4">
            {/* Pet Policy */}
            {property.pet_policy && (
              <div className="flex items-start gap-3">
                <Dog className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Pet Policy</p>
                  <div className="flex items-start gap-2 mt-1">
                    {property.pet_policy.toLowerCase().includes('allow') || 
                     property.pet_policy.toLowerCase().includes('yes') ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : property.pet_policy.toLowerCase().includes('no') ? (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    ) : null}
                    <p className="text-gray-900">{property.pet_policy}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Smoking Policy */}
            {property.smoking_policy && (
              <div className="flex items-start gap-3">
                <Cigarette className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Smoking Policy</p>
                  <div className="flex items-start gap-2 mt-1">
                    {property.smoking_policy.toLowerCase().includes('no') || 
                     property.smoking_policy.toLowerCase().includes('free') ? (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    ) : property.smoking_policy.toLowerCase().includes('allow') ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : null}
                    <p className="text-gray-900">{property.smoking_policy}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Policy information not available
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Contact the property for policy details
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-500">
            All policies are subject to change. Please confirm current policies with the property management before applying.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyPolicies; 