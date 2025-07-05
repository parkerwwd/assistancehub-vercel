
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Bus, Bike } from "lucide-react";

const PHAWalkScore: React.FC = () => {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Car className="w-3 h-3 text-orange-600" />
          Walk Score
        </CardTitle>
        <CardDescription className="text-xs">Walk, Transit, and Bike Scores for this location</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-100">
            <Car className="w-3 h-3 mx-auto mb-1 text-orange-600" />
            <div className="text-xs text-gray-500 mb-1">Walk Score</div>
            <div className="text-xl font-bold text-orange-700 mb-1">24</div>
          </div>
          
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Bus className="w-3 h-3 mx-auto mb-1 text-blue-600" />
            <div className="text-xs text-gray-500 mb-1">Transit Score</div>
            <div className="text-xl font-bold text-blue-700 mb-1">21</div>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <Bike className="w-3 h-3 mx-auto mb-1 text-green-600" />
            <div className="text-xs text-gray-500 mb-1">Bike Score</div>
            <div className="text-xl font-bold text-green-700 mb-1">59</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAWalkScore;
