import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { generatePropertyDescription } from "@/utils/propertyDescriptionGenerator";

interface PropertyDescriptionProps {
  property: Property;
}

const PropertyDescription: React.FC<PropertyDescriptionProps> = ({ property }) => {
  const description = generatePropertyDescription(property);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5 text-purple-600" />
          About This Property
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default PropertyDescription; 