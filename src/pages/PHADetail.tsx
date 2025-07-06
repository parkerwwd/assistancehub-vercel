import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import PHADetailView from "@/components/PHADetailView";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

const PHADetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigatedRef = useRef(false);

  // Track if user has navigated within the app
  useEffect(() => {
    // Check if there's a state indicating navigation from within the app
    // This includes location state, referrer, or sufficient history length
    if (location.state || 
        document.referrer.includes(window.location.origin) || 
        window.history.length > 2) {
      hasNavigatedRef.current = true;
    }
  }, [location.state]);

  const { data: office, isLoading, error } = useQuery({
    queryKey: ['pha-office', id],
    queryFn: async () => {
      if (!id) throw new Error('No office ID provided');
      
      const { data, error } = await supabase
        .from('pha_agencies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PHAAgency;
    },
    enabled: !!id
  });

  const handleBack = () => {
    // Check if we can go back in history
    // This is a heuristic approach since React Router doesn't provide a direct way
    const hasHistory = window.history.length > 1;
    const hasLocationState = location.state !== null;
    const notDirectAccess = location.key !== 'default';
    
    // If any indicator suggests there's a previous page, try to go back
    if (hasHistory && (hasLocationState || notDirectAccess || hasNavigatedRef.current)) {
      try {
        navigate(-1);
      } catch (error) {
        // If navigate(-1) fails, fall back to Section 8
        navigate('/section8');
      }
    } else {
      // No previous page detected, go to Section 8
      navigate('/section8');
    }
  };

  const handleViewHousing = (office: PHAAgency) => {
    // You can implement housing listings navigation here
    console.log('View housing for:', office.name);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading office details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !office) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Office Not Found</h2>
            <p className="text-gray-600 mb-4">The requested PHA office could not be found.</p>
            <Button onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <PHADetailView 
        office={office}
        onViewHousing={handleViewHousing}
        onBack={handleBack}
      />
    </>
  );
};

export default PHADetail;
