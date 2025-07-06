
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, Heart, MapPin, Phone, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const StateWaitlists = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';
  
  const [phaAgencies, setPHAAgencies] = useState<PHAAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPHAData = async () => {
      try {
        setLoading(true);
        console.log('Fetching PHA data for state:', stateName);
        
        const { data, error } = await supabase
          .from('pha_agencies')
          .select('*')
          .ilike('address', `%${stateName}%`)
          .order('name');

        if (error) {
          throw error;
        }

        console.log('Fetched PHA data:', data);
        setPHAAgencies(data || []);
      } catch (err) {
        console.error('Error fetching PHA data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
      } finally {
        setLoading(false);
      }
    };

    if (stateName) {
      fetchPHAData();
    }
  }, [stateName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading housing authorities for {stateName}...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading data: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to={`/state/${encodeURIComponent(stateName)}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {stateName} Overview
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mr-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Open Section 8 Waitlists In {stateName}
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Here are the waitlists our system has found for you. Please contact PHAs directly for most up-to-date information.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                Found {phaAgencies.length} housing authorities in {stateName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PHA Listings */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {phaAgencies.map((agency) => (
            <Card key={agency.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Agency Image Placeholder */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-white rounded opacity-20"></div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {agency.name}
                        </h3>
                        
                        {agency.address && (
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{agency.address}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {agency.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              <span>{agency.phone}</span>
                            </div>
                          )}
                          
                          {agency.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              <span>{agency.email}</span>
                            </div>
                          )}
                        </div>
                        
                        {agency.program_type && (
                          <div className="mt-3">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              agency.program_type === 'Section 8' 
                                ? 'bg-purple-100 text-purple-800' 
                                : agency.program_type === 'Low-Rent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {agency.program_type} PHA
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Check Waitlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {phaAgencies.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Housing Authorities Found</h3>
              <p className="text-gray-500">
                We couldn't find any housing authorities in {stateName} at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StateWaitlists;
