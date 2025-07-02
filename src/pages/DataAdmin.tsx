
import React from 'react';
import { Link } from "react-router-dom";
import PHADataManager from "@/components/PHADataManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, Users, Activity } from "lucide-react";

const DataAdmin = () => {
  console.log('DataAdmin component rendering...');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-900 hover:text-blue-800 transition-colors">
                AssistanceHub
              </Link>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Admin Dashboard
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Administration Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive data management for all assistance programs. 
            Monitor data quality, import statistics, and maintain database integrity.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Data Sources</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Active data integrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Managed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                Across all databases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h ago</div>
              <p className="text-xs text-muted-foreground">
                PHA data update
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <div className="space-y-8">
          {/* PHA Data Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Public Housing Authority (PHA) Data
            </h2>
            <PHADataManager />
          </div>

          {/* SNAP Data Section - Placeholder */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              SNAP Office Data
            </h2>
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-lg">SNAP Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>SNAP data management features coming soon</p>
                  <p className="text-sm mt-2">Integration with USDA FNS data sources</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Data Sources */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Additional Data Sources
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Housing Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500">
                    <p>Integration with housing listing APIs</p>
                    <p className="text-sm mt-2">Coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Waitlist Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500">
                    <p>Real-time waitlist status updates</p>
                    <p className="text-sm mt-2">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Quality</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automated validation checks</li>
                    <li>• Duplicate detection</li>
                    <li>• Address standardization</li>
                    <li>• Contact verification</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Update Schedule</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• HUD PHA data: Monthly</li>
                    <li>• SNAP offices: Quarterly</li>
                    <li>• Waitlist status: Weekly</li>
                    <li>• User corrections: Real-time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Sources</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• HUD PHA Contact API</li>
                    <li>• USDA FNS Office Data</li>
                    <li>• State housing databases</li>
                    <li>• Community submissions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataAdmin;
