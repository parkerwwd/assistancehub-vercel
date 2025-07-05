
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Car, Bus, Bike } from "lucide-react";

const PHAWalkScore: React.FC = () => {
  const getScoreDescription = (score: number, type: 'walk' | 'transit' | 'bike') => {
    if (type === 'walk') {
      if (score >= 90) return 'Walker\'s Paradise';
      if (score >= 70) return 'Very Walkable';
      if (score >= 50) return 'Somewhat Walkable';
      if (score >= 25) return 'Car-Dependent';
      return 'Car-Dependent';
    }
    
    if (type === 'transit') {
      if (score >= 90) return 'Excellent Transit';
      if (score >= 70) return 'Excellent Transit';
      if (score >= 50) return 'Good Transit';
      if (score >= 25) return 'Some Transit';
      return 'Minimal Transit';
    }
    
    if (type === 'bike') {
      if (score >= 90) return 'Biker\'s Paradise';
      if (score >= 70) return 'Very Bikeable';
      if (score >= 50) return 'Bikeable';
      if (score >= 30) return 'Somewhat Bikeable';
      return 'Not Bikeable';
    }
    
    return '';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-700';
    if (score >= 50) return 'text-yellow-700';
    if (score >= 25) return 'text-orange-700';
    return 'text-red-700';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const scores = [
    { 
      title: 'Walk Score', 
      value: 24, 
      icon: Car, 
      type: 'walk' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      iconColor: 'text-orange-600'
    },
    { 
      title: 'Transit Score', 
      value: 21, 
      icon: Bus, 
      type: 'transit' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Bike Score', 
      value: 59, 
      icon: Bike, 
      type: 'bike' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      iconColor: 'text-green-600'
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scores.map((scoreData) => (
            <div key={scoreData.title} className={`p-3 ${scoreData.bgColor} rounded-lg border ${scoreData.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <scoreData.icon className={`w-4 h-4 ${scoreData.iconColor}`} />
                <div className="text-xs text-gray-600 font-medium">{scoreData.title}</div>
              </div>
              
              <div className={`text-2xl font-bold mb-1 ${getScoreColor(scoreData.value)}`}>
                {scoreData.value}
              </div>
              
              <div className="mb-2">
                <Progress 
                  value={scoreData.value} 
                  className="h-2 bg-white/50" 
                />
              </div>
              
              <div className="text-xs text-gray-600 font-medium">
                {getScoreDescription(scoreData.value, scoreData.type)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PHAWalkScore;
