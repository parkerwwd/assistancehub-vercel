
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Bus, 
  Bike, 
  ShoppingCart, 
  Utensils, 
  Building2, 
  GraduationCap,
  Cross,
  Landmark,
  X
} from "lucide-react";

interface WalkScoreBreakdownProps {
  type: 'walk' | 'transit' | 'bike';
  score: number;
  breakdown?: {
    nearbyAmenities: Array<{
      type: string;
      count: number;
      avgDistance: number;
    }>;
    transitStops: number;
    bikeInfrastructure: number;
  };
  onClose: () => void;
}

const WalkScoreBreakdown: React.FC<WalkScoreBreakdownProps> = ({ 
  type, 
  score, 
  breakdown, 
  onClose 
}) => {
  const getAmenityIcon = (amenityType: string) => {
    switch (amenityType) {
      case 'restaurant': return Utensils;
      case 'grocery': return ShoppingCart;
      case 'school': return GraduationCap;
      case 'hospital': return Cross;
      case 'bank': return Landmark;
      default: return Building2;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-700';
    if (score >= 50) return 'text-yellow-700';
    if (score >= 25) return 'text-orange-700';
    return 'text-red-700';
  };

  const getTitle = () => {
    switch (type) {
      case 'walk': return 'Walk Score Breakdown';
      case 'transit': return 'Transit Score Breakdown';
      case 'bike': return 'Bike Score Breakdown';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'walk': return 'Based on proximity to essential amenities';
      case 'transit': return 'Based on public transportation access';
      case 'bike': return 'Based on bike infrastructure and destinations';
    }
  };

  return (
    <Card className="shadow-lg border bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {type === 'walk' && <MapPin className="w-5 h-5 text-orange-600" />}
              {type === 'transit' && <Bus className="w-5 h-5 text-blue-600" />}
              {type === 'bike' && <Bike className="w-5 h-5 text-green-600" />}
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-sm">{getDescription()}</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}
          </div>
          <Progress value={score} className="h-3 mb-2" />
          <div className="text-sm text-gray-600">
            Overall {type.charAt(0).toUpperCase() + type.slice(1)} Score
          </div>
        </div>

        {/* Breakdown Details */}
        {breakdown && (
          <div className="space-y-3">
            {type === 'walk' && breakdown.nearbyAmenities && (
              <div>
                <h4 className="font-medium text-sm mb-2">Nearby Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {breakdown.nearbyAmenities.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity.type);
                    return (
                      <div key={amenity.type} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium capitalize">{amenity.type}</div>
                          <div className="text-xs text-gray-500">
                            {amenity.count} within {Math.round(amenity.avgDistance)}m
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {amenity.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {type === 'transit' && (
              <div>
                <h4 className="font-medium text-sm mb-2">Public Transportation</h4>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Bus className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Transit Stops Nearby</div>
                    <div className="text-xs text-gray-600">
                      {breakdown.transitStops} stops within walking distance
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {breakdown.transitStops}
                  </Badge>
                </div>
              </div>
            )}

            {type === 'bike' && (
              <div>
                <h4 className="font-medium text-sm mb-2">Bike Infrastructure</h4>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Bike className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Bike-Friendly Features</div>
                    <div className="text-xs text-gray-600">
                      {breakdown.bikeInfrastructure} bike lanes, paths, and rental stations
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {breakdown.bikeInfrastructure}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t text-xs text-gray-500">
          <p>Scores calculated using OpenStreetMap data and proximity algorithms.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalkScoreBreakdown;
