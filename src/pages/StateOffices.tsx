
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';
import { CheckCircle, MapPin, Phone, Mail, Heart, Building, ArrowLeft, ExternalLink, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StateOffices = () => {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stateName = state ? decodeURIComponent(state) : '';
  const cityFilter = searchParams.get('city');
  
  const { allPHAAgencies, loading } = usePHAData();
  
  // Filter PHA agencies by state and optionally by city
  const statePHAAgencies = React.useMemo(() => {
    if (!stateName || !allPHAAgencies.length) return [];
    
    let filtered = filterPHAAgenciesByState(allPHAAgencies, stateName);
    
    // If city filter is provided, filter by city
    if (cityFilter) {
      filtered = filtered.filter(agency => {
        const address = agency.address || '';
        const agencyName = agency.name || '';
        return address.toLowerCase().includes(cityFilter.toLowerCase()) ||
               agencyName.toLowerCase().includes(cityFilter.toLowerCase());
      });
    }
    
    return filtered;
  }, [stateName, allPHAAgencies, cityFilter]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const handleOfficeClick = (agency: any) => {
    navigate(`/pha/${agency.id}`);
  };

  const handleToggleFavorite = (agency: any, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Toggle favorite for:', agency.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      
      {/* Back Button */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Previous Page
          </Button>
        </div>
      </div>
      
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {cityFilter 
                ? `Section 8 Offices in ${cityFilter}`
                : `Section 8 Offices in ${stateName}`
              }
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {cityFilter 
                ? `Discover housing assistance programs specifically available in ${cityFilter}. Connect with local PHAs for the most current information.`
                : `Explore comprehensive housing assistance programs across ${stateName}. Find your local Public Housing Authority and get started today.`
              }
            </p>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 inline-block border border-white/20 shadow-xl">
              <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                <Building className="w-6 h-6" />
                <span>{statePHAAgencies.length} {statePHAAgencies.length === 1 ? 'Office' : 'Offices'} Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Offices Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {statePHAAgencies.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">No Offices Found</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                {cityFilter 
                  ? `We couldn't find any PHA offices in ${cityFilter}, ${stateName} at this time. Try exploring other cities or check back later.`
                  : `We couldn't find any PHA offices for ${stateName} at this time. Please check back later for updates.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statePHAAgencies.map((agency, index) => (
                <Card 
                  key={agency.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer hover:-translate-y-2 hover:scale-[1.02]"
                  onClick={() => handleOfficeClick(agency)}
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleToggleFavorite(agency, e)}
                          className="text-white/80 hover:text-red-400 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 text-purple-700 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Public Housing Authority
                        </span>
                      </div>
                      <Building className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/20" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {agency.name}
                        </h3>
                        {agency.address && (
                          <div className="flex items-start text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                            <span className="text-sm leading-relaxed">{agency.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info Grid */}
                      <div className="space-y-3 mb-6">
                        {agency.phone && (
                          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <Phone className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-green-800">{agency.phone}</span>
                          </div>
                        )}
                        {agency.email && (
                          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Mail className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-blue-800 truncate">{agency.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Program Info */}
                      <div className="flex items-center justify-between mb-4">
                        {agency.program_type && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                            {agency.program_type}
                          </span>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Updated recently</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOfficeClick(agency);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StateOffices;
