
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileUp, Edit, Plus } from "lucide-react";

interface PHAStatsCardProps {
  totalPHAs: number;
  lastImport: Date | null;
  importStats: {
    filesUploaded: number;
    recordsAdded: number;
    recordsEdited: number;
    lastFileName?: string;
  };
}

export const PHAStatsCard: React.FC<PHAStatsCardProps> = ({ 
  totalPHAs, 
  lastImport, 
  importStats 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total PHAs</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalPHAs.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Active housing authorities
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
          <FileUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{importStats.filesUploaded}</div>
          <p className="text-xs text-muted-foreground">
            {importStats.lastFileName || 'No recent uploads'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Records Added</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{importStats.recordsAdded.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            New PHA records
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Records Updated</CardTitle>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{importStats.recordsEdited.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Modified records
          </p>
        </CardContent>
      </Card>

      {lastImport && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Last Database Update</p>
                <p className="text-lg text-gray-900">{lastImport.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Database was last synchronized with HUD data sources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
