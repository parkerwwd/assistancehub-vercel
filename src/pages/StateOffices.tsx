
import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';
import { CheckCircle, MapPin, Phone, Mail, Heart, Building, ArrowLeft, ChevronDown, Star, Clock, Users, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StateOffices = () => {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stateName = state ? decodeURIComponent(state) : '';
  const cityFilter = searchParams.get('city');
  
  const { allPHAAgencies, loading } = usePHAData();
  const [visibleCount, setVisibleCount] = useState(5);
  
  // Filter PHA agencies by state and optionally by city
  const statePHAAgencies = React.useMemo(() => {
    if (!stateName || !allPHAAgencies.length) return [];
    
    let filtered = filterPHAAgenciesByState(allPHAAgencies, stateName);
    
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

  const visibleAgencies = statePHAAgencies.slice(0, visibleCount);
  const hasMoreAgencies = visibleCount < statePHAAgencies.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, statePHAAgencies.length));
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDetailView = (agency: any) => {
    navigate(`/pha/${agency.id}`);
  };

  const handleToggleFavorite = (agency: any) => {
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
      
      {/* Modern Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </Button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>Housing</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">{stateName}</span>
              {cityFilter && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{cityFilter}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section with Enhanced Design */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Status Badge */}
              <div className="inline-flex items-center justify-center bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 mb-6">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                <span className="text-green-100 font-medium">Active Listings</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {cityFilter 
                  ? `Section 8 in ${cityFilter}`
                  : `${stateName} Housing`
                }
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                {cityFilter 
                  ? `Discover available housing opportunities in ${cityFilter}, ${stateName}`
                  : `Find your next home with our comprehensive directory of housing authorities`
                }
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Building className="w-6 h-6 text-blue-200" />
                  </div>
                  <div className="text-xl font-bold text-white">{statePHAAgencies.length}</div>
                  <div className="text-blue-200 text-sm">Active Offices</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-purple-200" />
                  </div>
                  <div className="text-xl font-bold text-white">24/7</div>
                  <div className="text-purple-200 text-sm">Support Available</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-green-200" />
                  </div>
                  <div className="text-xl font-bold text-white">Verified</div>
                  <div className="text-green-200 text-sm">Information</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Offices List */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {statePHAAgencies.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Building className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-600 mb-4">No Offices Found</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                {cityFilter 
                  ? `We couldn't find any PHA offices in ${cityFilter}, ${stateName} at this time.`
                  : `We couldn't find any PHA offices for ${stateName} at this time.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Available Housing Offices
                </h2>
                <p className="text-gray-600 text-base max-w-2xl mx-auto">
                  Connect directly with housing authorities in your area. Each office provides personalized assistance for your housing needs.
                </p>
              </div>

              {/* Compact Office Cards */}
              <div className="grid gap-4">
                {visibleAgencies.map((agency, index) => (
                  <Card key={agency.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-[1.01]">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Compact Image Section */}
                        <div className="w-full lg:w-64 h-40 lg:h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 relative overflow-hidden">
                          {/* Animated background patterns */}
                          <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                          }}></div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                          
                          {/* Content overlay */}
                          <div className="absolute inset-0 flex flex-col justify-between p-4">
                            <div className="flex justify-between items-start">
                              <span className="bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                Section 8 PHA
                              </span>
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                                <Star className="w-3 h-3 text-yellow-300" />
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <Building className="w-8 h-8 text-white/40 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
                                <span className="text-white text-xs font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Quick Response
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Content Section */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                  {agency.name}
                                </h3>
                                {agency.address && (
                                  <div className="flex items-start text-gray-600 mb-3">
                                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                                    <span className="text-sm leading-relaxed">{agency.address}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(agency)}
                                className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110 rounded-full h-8 w-8"
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Compact Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              {agency.phone && (
                                <div className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <Phone className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-green-600 font-medium">Phone</div>
                                    <div className="text-green-700 font-semibold text-sm">{agency.phone}</div>
                                  </div>
                                </div>
                              )}
                              {agency.email && (
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <Mail className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-blue-600 font-medium">Email</div>
                                    <div className="text-blue-700 font-semibold text-sm truncate max-w-[120px]">{agency.email}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Compact Action Section */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
                              <Button
                                onClick={() => handleDetailView(agency)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                              >
                                <CheckCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                View Details
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                {agency.program_type && (
                                  <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                    {agency.program_type}
                                  </span>
                                )}
                                <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                  Available
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Enhanced Show More Button */}
              {hasMoreAgencies && (
                <div className="text-center pt-8">
                  <div className="inline-flex flex-col items-center gap-3">
                    <Button
                      onClick={handleShowMore}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/more"
                    >
                      <ChevronDown className="w-5 h-5 mr-2 group-hover/more:translate-y-1 transition-transform" />
                      Load More Offices
                    </Button>
                    <p className="text-gray-500 text-sm">
                      {statePHAAgencies.length - visibleCount} more offices available
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StateOffices;
