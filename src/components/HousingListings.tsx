import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, DollarSign, Users, Bed } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface HousingListingsProps {
  office: PHAAgency;
  onBack: () => void;
}

// Mock housing data - this will eventually come from affordablehousing.com API
const mockListings = [
  {
    id: 1,
    name: "Sunrise Apartments",
    address: "123 Main St, Anytown, USA",
    type: "Section 8",
    availability: "Now",
    image: "/placeholder.svg",
    distance: 2.5
  },
  {
    id: 2,
    name: "Oak Grove Housing",
    address: "456 Oak Ave, Somewhere, USA",
    type: "Public Housing",
    availability: "Contact for info",
    image: "/placeholder.svg",
    distance: 4.2
  },
  {
    id: 3,
    name: "Downtown Plaza",
    address: "789 Center St, Metro City, USA",
    type: "Section 8",
    availability: "Limited",
    image: "/placeholder.svg",
    distance: 1.8
  }
];

const HousingListings: React.FC<HousingListingsProps> = ({ office, onBack }) => {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="mb-4"
        >
          ← Back to PHA Details
        </Button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Available Housing Near {office.name}
        </h2>
        <p className="text-sm text-gray-600">
          Low-income housing options in the area served by this PHA
        </p>
      </div>

      <div className="space-y-4">
        {mockListings.map((listing) => (
          <Card key={listing.id} className="shadow-sm border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 mb-1">
                    {listing.name}
                  </CardTitle>
                  <CardDescription className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span>{listing.address}</span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{listing.availability}</div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Property Details */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{listing.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>{listing.distance} miles away</span>
                </div>
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Availability:
                </span>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    listing.availability === 'Contact for info'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {listing.availability}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  View Details
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  Apply Now
                </Button>
              </div>

              {/* Integration Note */}
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> This data will be integrated with affordablehousing.com database
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 text-center">
        <Button variant="outline" size="sm">
          Load More Housing Options
        </Button>
      </div>
    </div>
  );
};

export default HousingListings;
