import React from 'react';
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyContactInfoProps {
  property: Property;
}

const PropertyContactInfo: React.FC<PropertyContactInfoProps> = ({ property }) => {
  const hasContactInfo = property.phone || property.email || property.website;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {hasContactInfo ? (
          <>
            {/* Phone */}
            {property.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone</p>
                  <a 
                    href={`tel:${property.phone}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {property.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {property.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${property.email}`}
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    {property.email}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {property.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Website</p>
                  <a 
                    href={property.website.startsWith('http') ? property.website : `https://${property.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    {property.website}
                  </a>
                </div>
              </div>
            )}

            {/* Apply Button */}
            {property.website && (
              <div className="pt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.open(
                    property.website.startsWith('http') ? property.website : `https://${property.website}`,
                    '_blank'
                  )}
                >
                  Apply Online
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 font-medium">
              Contact PHA for More Information
            </p>
          </div>
        )}

        {/* Managing PHA Link */}
        {property.pha_id && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">
              Managed by a Public Housing Authority
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/pha/${property.pha_id}`}
            >
              View Managing PHA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyContactInfo; 