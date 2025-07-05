
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Bus, Bike, AlertCircle, ExternalLink } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { WalkScoreService } from "@/services/walkScoreService";
import WalkScoreBreakdown from "./WalkScoreBreakdown";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHAWalkScoreProps {
  office: PHAAgency;
}

const PHAWalkScore: React.FC<PHAWalkScoreProps> = ({ office }) => {
  const [scores, setScores] = useState({
    walkScore: 0,
    transitScore: 0,
    bikeScore: 0,
    loading: true,
    error: null as string | null,
    breakdown: null as any
  });
  
  const [selectedBreakdown, setSelectedBreakdown] = useState<{
    type: 'walk' | 'transit' | 'bike';
    score: number;
  } | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      if (!office.address) {
        setScores(prev => ({
          ...prev,
          loading: false,
          error: 'No address available for this location'
        }));
        return;
      }

      console.log('🚶 Calculating walkability scores for:', office.name);
      
      try {
        // Try to use geocoded coordinates if available
        const coordinates = (office as any).geocoded_latitude && (office as any).geocoded_longitude 
          ? {
              lat: (office as any).geocoded_latitude,
              lng: (office as any).geocoded_longitude
            }
          : undefined;

        const result = await WalkScoreService.calculateScores(office.address, coordinates);
        
        setScores({
          walkScore: result.walkScore,
          transitScore: result.transitScore,
          bikeScore: result.bikeScore,
          loading: false,
          error: result.error || null,
          breakdown: result.breakdown
        });

        console.log('✅ Walkability scores calculated:', {
          walk: result.walkScore,
          transit: result.transitScore,
          bike: result.bikeScore
        });
      } catch (error) {
        console.error('❌ Error calculating walkability scores:', error);
        setScores(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to calculate walkability scores'
        }));
      }
    };

    fetchScores();
  }, [office]);

  const generateWalkScoreUrl = (address: string) => {
    if (!address) return '';
    
    // Format address for Walk Score URL - replace spaces with dashes and make lowercase
    const formattedAddress = address
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and dashes
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    return `https://www.walkscore.com/score/${formattedAddress}`;
  };

  const handleTitleClick = () => {
    if (office.address) {
      const walkScoreUrl = generateWalkScoreUrl(office.address);
      window.open(walkScoreUrl, '_blank');
    }
  };

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

  const handleCardClick = (type: 'walk' | 'transit' | 'bike', score: number) => {
    if (!scores.loading && !scores.error) {
      setSelectedBreakdown({ type, score });
    }
  };

  const scoreData = [
    { 
      title: 'Walk Score', 
      value: scores.walkScore, 
      icon: Car, 
      type: 'walk' as const,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      iconColor: 'text-orange-600'
    },
    { 
      title: 'Transit Score', 
      value: scores.transitScore, 
      icon: Bus, 
      type: 'transit' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Bike Score', 
      value: scores.bikeScore, 
      icon: Bike, 
      type: 'bike' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      iconColor: 'text-green-600'
    }
  ];

  if (selectedBreakdown) {
    return (
      <WalkScoreBreakdown
        type={selectedBreakdown.type}
        score={selectedBreakdown.score}
        breakdown={scores.breakdown}
        onClose={() => setSelectedBreakdown(null)}
      />
    );
  }

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-1">
        <CardTitle 
          className="flex items-center gap-2 text-base cursor-pointer hover:text-blue-600 transition-colors group"
          onClick={handleTitleClick}
        >
          <img 
            src="/lovable-uploads/c30a91ac-2aa4-4263-a0e0-4be5156e797e.png" 
            alt="Walk Score" 
            className="w-4 h-4"
          />
          Walk Score
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </CardTitle>
        <CardDescription className="text-xs">
          Walk, Transit, and Bike Scores for this location • Click for details
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {scores.error ? (
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
            <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-700">{scores.error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scoreData.map((scoreInfo) => (
              <div 
                key={scoreInfo.title} 
                className={`p-3 ${scoreInfo.bgColor} rounded-lg border ${scoreInfo.borderColor} cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                onClick={() => handleCardClick(scoreInfo.type, scoreInfo.value)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <scoreInfo.icon className={`w-4 h-4 ${scoreInfo.iconColor}`} />
                  <div className="text-xs text-gray-600 font-medium">{scoreInfo.title}</div>
                </div>
                
                {scores.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <>
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(scoreInfo.value)}`}>
                      {scoreInfo.value}
                    </div>
                    
                    <div className="mb-2">
                      <Progress 
                        value={scoreInfo.value} 
                        className="h-2 bg-white/50" 
                      />
                    </div>
                    
                    <div className="text-xs text-gray-600 font-medium">
                      {getScoreDescription(scoreInfo.value, scoreInfo.type)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PHAWalkScore;
