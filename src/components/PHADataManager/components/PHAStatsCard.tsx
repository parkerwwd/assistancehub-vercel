
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileUp, Edit, Plus, TrendingUp, Calendar } from "lucide-react";

interface PHAStatsCardProps {
  totalPHAs: number;
  lastImport: Date | null;
  totals: {
    totalFiles: number;
    totalAdded: number;
    totalEdited: number;
    totalRecords: number;
  };
}

export const PHAStatsCard: React.FC<PHAStatsCardProps> = ({ 
  totalPHAs, 
  lastImport, 
  totals 
}) => {
  // Provide default values if totals is undefined
  const safeTotals = totals || {
    totalFiles: 0,
    totalAdded: 0,
    totalEdited: 0,
    totalRecords: 0
  };

  const statsCards = [
    {
      title: "Total PHAs",
      value: totalPHAs.toLocaleString(),
      description: "Active housing authorities",
      icon: Database,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      iconBg: "bg-blue-500"
    },
    {
      title: "Files Imported",
      value: safeTotals.totalFiles.toString(),
      description: "CSV files processed",
      icon: FileUp,
      color: "green",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      textColor: "text-green-700",
      iconBg: "bg-green-500"
    },
    {
      title: "Records Added",
      value: safeTotals.totalAdded.toLocaleString(),
      description: "New PHA records",
      icon: Plus,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      textColor: "text-purple-700",
      iconBg: "bg-purple-500"
    },
    {
      title: "Records Updated",
      value: safeTotals.totalEdited.toLocaleString(),
      description: "Modified records",
      icon: Edit,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100", 
      textColor: "text-orange-700",
      iconBg: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Mobile-First Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.title}
              className={`group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${stat.bgGradient} hover:scale-[1.02] transform`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 lg:p-3 ${stat.iconBg} rounded-lg sm:rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0`}>
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className={`text-lg sm:text-2xl lg:text-3xl font-bold ${stat.textColor} mb-1 sm:mb-2 group-hover:scale-105 transition-transform duration-300 leading-tight`}>
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 leading-tight">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                  <span className="truncate">{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile-First Last Import Information */}
      {lastImport && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 leading-tight">
                    Last Database Synchronization
                  </p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight break-all">
                    {lastImport.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-700">System Synchronized</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                  Database was last updated with HUD data sources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
