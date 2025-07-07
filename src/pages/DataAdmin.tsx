
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import PHADataManager from "@/components/PHADataManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileText, Users, Activity, LogOut, TrendingUp, Shield, Zap, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDataAdminStats } from "@/hooks/useDataAdminStats";
import { geocodeAllPHAs } from "@/services/phaGeocodeService";
import { useState } from "react";

const DataAdmin = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { totalDataSources, filesProcessed, recordsManaged, phasWithoutCoordinates, lastActivity, isLoading } = useDataAdminStats();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeocode = async () => {
    // Get Mapbox token from environment variable
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      toast({
        title: "Error",
        description: "Mapbox token not found. Please check your environment configuration.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeocoding(true);
    setGeocodeProgress(null);
    
    try {
      const result = await geocodeAllPHAs(token, (current, total) => {
        setGeocodeProgress({ current, total });
      });
      
      if (result.success) {
        toast({
          title: "Geocoding Complete",
          description: result.message,
        });
      } else {
        toast({
          title: "Geocoding Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to geocode PHAs",
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
      setGeocodeProgress(null);
    }
  };

  console.log('DataAdmin component rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile-optimized Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/221b75b2-2ed8-4872-b9ef-18b878e8e8fe.png" 
                  alt="AssistanceHub Logo" 
                  className="h-10 sm:h-14 w-auto drop-shadow-sm"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="text-xs sm:text-sm text-white/90 hidden md:block">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Logged in as: <span className="font-semibold text-white break-all">{user?.email}</span></span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Mobile-optimized Page Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Database className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
              Data Administration Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Comprehensive data management platform for all assistance programs. 
            Monitor data quality, track import statistics, and maintain database integrity with enterprise-grade tools.
          </p>
        </div>

        {/* Mobile-optimized Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Data Sources</CardTitle>
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                <Database className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 mb-1">
                {isLoading ? '...' : totalDataSources}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                Active integrations
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Files Processed</CardTitle>
              <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                <FileText className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-1">
                {isLoading ? '...' : filesProcessed}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <Zap className="h-2 w-2 sm:h-3 sm:w-3" />
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Records Managed</CardTitle>
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                <Users className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-1">
                {isLoading ? '...' : recordsManaged.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <Database className="h-2 w-2 sm:h-3 sm:w-3" />
                Across all databases
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Last Activity</CardTitle>
              <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                <Activity className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 mb-1">
                {isLoading ? '...' : lastActivity}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <Activity className="h-2 w-2 sm:h-3 sm:w-3" />
                PHA data update
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Geocoding Section */}
        <div className="mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white rounded-t-xl p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                Geocoding Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-gray-600 mb-4">
                Geocode PHA offices that are missing coordinates to enable location-based search.
              </p>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGeocode}
                  disabled={isGeocoding}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGeocoding ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Geocode Missing Coordinates
                    </>
                  )}
                </Button>
                
                {geocodeProgress && (
                  <span className="text-sm text-gray-600">
                    Progress: {geocodeProgress.current} / {geocodeProgress.total}
                  </span>
                )}
              </div>
              
              {!isLoading && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    PHAs without coordinates: {phasWithoutCoordinates || 0}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile-optimized Data Sources */}
        <div className="space-y-8 sm:space-y-12">
          {/* PHA Data Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Database className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Public Housing Authority (PHA) Data
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Manage and monitor HUD PHA database records</p>
              </div>
            </div>
            <PHADataManager />
          </div>

          {/* SNAP Data Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  SNAP Office Data
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Integration with USDA FNS data sources</p>
              </div>
            </div>
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-green-50">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <div className="text-center">
                  <div className="p-4 sm:p-6 bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">SNAP Data Management</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">Advanced integration with USDA Food and Nutrition Service</p>
                  <p className="text-xs sm:text-sm text-gray-500">Coming soon with real-time sync capabilities</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Data Sources */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Additional Data Sources
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Extended integrations and future capabilities</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="p-3 sm:p-4 bg-blue-100 rounded-xl sm:rounded-2xl w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <Database className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Housing Listings</h3>
                    <p className="text-sm text-gray-600 mb-2">Integration with housing listing APIs</p>
                    <p className="text-xs text-gray-500">Real-time availability tracking</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-purple-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="p-3 sm:p-4 bg-purple-100 rounded-xl sm:rounded-2xl w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Waitlist Management</h3>
                    <p className="text-sm text-gray-600 mb-2">Real-time waitlist status updates</p>
                    <p className="text-xs text-gray-500">Automated notifications</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile-optimized System Information */}
        <div className="mt-12 sm:mt-16">
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-t-xl p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                System Information & Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Data Quality</h3>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      Automated validation checks
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      Duplicate detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      Address standardization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      Contact verification
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Update Schedule</h3>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      HUD PHA data: Monthly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      SNAP offices: Quarterly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      Waitlist status: Weekly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      User corrections: Real-time
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Data Sources</h3>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      HUD PHA Contact API
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      USDA FNS Office Data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      State housing databases
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      Community submissions
                    </li>
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
