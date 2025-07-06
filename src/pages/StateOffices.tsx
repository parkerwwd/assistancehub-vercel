
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Phone, Mail, ExternalLink, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';
import { getPHATypeFromData, getPHATypeColor } from '@/utils/mapUtils';
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const StateOffices = () => {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const stateName = state ? decodeURIComponent(state) : '';
  
  const { allPHAAgencies, loading } = usePHAData();
  
  // Filter PHA agencies by state
  const statePHAAgencies = React.useMemo(() => {
    if (!stateName || !allPHAAgencies.length) return [];
    return filterPHAAgenciesByState(allPHAAgencies, stateName);
  }, [stateName, allPHAAgencies]);

  const handleBackClick = () => {
    navigate(`/state/${encodeURIComponent(stateName)}`);
  };

  const handleOfficeClick = (office: PHAAgency) => {
    navigate(`/pha/${office.id}`);
  };

  const handleViewOnMap = () => {
    navigate('/section8', { 
      state: { 
        searchLocation: { 
          name: stateName, 
          type: 'state',
          stateCode: stateName 
        } 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PHA offices...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-500 rounded-full p-3 mr-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Section 8 Housing in {stateName}
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Here are the housing authorities our system has found for you. Please contact PHAs directly for most up-to-date information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleBackClick}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {stateName}
              </Button>
              <Button 
                onClick={handleViewOnMap}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statePHAAgencies.length}</div>
                <div className="text-sm text-gray-600">Offices Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Available</div>
                <div className="text-sm text-gray-600">Waitlists</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {statePHAAgencies.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No PHA offices found in {stateName}
              </h3>
              <p className="text-gray-500">
                Try checking other states or contact us if you believe this is an error.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {statePHAAgencies.map((agency, index) => {
                const phaType = getPHATypeFromData(agency);
                const phaColor = getPHATypeColor(phaType);
                
                return (
                  <Card 
                    key={agency.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-l-4 cursor-pointer overflow-hidden"
                    style={{ borderLeftColor: phaColor }}
                    onClick={() => handleOfficeClick(agency)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Left side - Image placeholder */}
                        <div 
                          className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute bottom-4 left-4">
                            <Badge 
                              className="text-white font-semibold px-3 py-1"
                              style={{ backgroundColor: phaColor }}
                            >
                              {phaType}
                            </Badge>
                          </div>
                          <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/30" />
                        </div>

                        {/* Right side - Content */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {agency.name}
                              </h3>
                              
                              {agency.address && (
                                <div className="flex items-start gap-2 mb-3">
                                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                                  <span className="text-gray-600 text-sm leading-relaxed">
                                    {agency.address}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-4 mb-4">
                                {agency.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-700 font-medium">
                                      {agency.phone}
                                    </span>
                                  </div>
                                )}
                                
                                {agency.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-700 font-medium">
                                      {agency.email}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle waitlist check
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Check Waitlist
                                </Button>
                              </div>
                            </div>

                            {/* Heart icon */}
                            <button 
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle favorite functionality
                              }}
                            >
                              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                            </button>
                          </div>

                          {/* Bottom info */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Click for detailed information</span>
                              <span>Updated: {new Date(agency.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Advertisement placeholder */}
          {statePHAAgencies.length > 5 && (
            <div className="mt-12 p-8 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Advertisement</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StateOffices;
