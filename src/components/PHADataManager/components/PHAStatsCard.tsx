
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
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.title}
              className={`group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${stat.bgGradient} hover:scale-105 transform`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 ${stat.iconBg} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.textColor} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Import Information */}
      {lastImport && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Last Database Synchronization</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {lastImport.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">System Synchronized</span>
                </div>
                <p className="text-sm text-gray-600">
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
