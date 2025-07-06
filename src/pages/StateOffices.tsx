
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';
import { CheckCircle, MapPin, Phone, Mail, Heart, Building, ArrowLeft } from 'lucide-react';
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

  const handleCheckWaitlist = (agency: any) => {
    // This would navigate to the individual PHA detail page
    console.log('Check waitlist for:', agency.name);
  };

  const handleToggleFavorite = (agency: any) => {
    // This would toggle the favorite status
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
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {cityFilter 
                ? `Section 8 Offices in ${cityFilter}, ${stateName}`
                : `Open Section 8 Waitlists In ${stateName}`
              }
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {cityFilter 
                ? `Showing offices specifically in ${cityFilter}. Contact PHAs directly for most up-to-date information.`
                : 'Here are the waitlists our system has found for you. Please contact PHAs directly for most up-to-date information.'
              }
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
              <div className="flex items-center justify-center gap-4 text-lg">
                <Building className="w-6 h-6" />
                <span className="font-semibold">{statePHAAgencies.length} Offices Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offices List */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {statePHAAgencies.length === 0 ? (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Offices Found</h3>
              <p className="text-gray-500">
                {cityFilter 
                  ? `We couldn't find any PHA offices in ${cityFilter}, ${stateName} at this time.`
                  : `We couldn't find any PHA offices for ${stateName} at this time.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {statePHAAgencies.map((agency, index) => (
                <Card key={agency.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image placeholder */}
                      <div className="w-full md:w-80 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 relative">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Section 8 PHA
                          </span>
                        </div>
                        <Building className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/30" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {agency.name}
                            </h3>
                            {agency.address && (
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="text-sm">{agency.address}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(agency)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-6 h-6" />
                          </Button>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {agency.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">{agency.phone}</span>
                            </div>
                          )}
                          {agency.email && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">{agency.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => handleCheckWaitlist(agency)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Check Waitlist
                          </Button>
                          
                          {agency.program_type && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {agency.program_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Advertisement placeholders */}
        {statePHAAgencies.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 space-y-8">
            <div className="text-center text-sm text-gray-500 mb-4">Advertisement</div>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Advertisement Space</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StateOffices;
