
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';
import { CheckCircle, MapPin, ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PHAOfficeCard from '@/components/PHAOfficeCard';

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

      {/* Offices Grid using PHAOfficeCard */}
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
              {statePHAAgencies.map((agency) => (
                <PHAOfficeCard 
                  key={agency.id} 
                  agency={agency}
                />
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
