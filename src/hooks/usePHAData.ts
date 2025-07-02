
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const usePHAData = () => {
  const [phaAgencies, setPHAAgencies] = useState<PHAAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const fetchPHAData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error: fetchError, count } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact' })
        .order('name')
        .range(from, to);

      if (fetchError) {
        throw fetchError;
      }

      console.log('✅ fetchPHAData successful:', {
        dataLength: data?.length || 0,
        totalCount: count,
        sampleRecord: data?.[0]
      });

      setPHAAgencies(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ Error fetching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const searchPHAs = async (query: string, page = 1) => {
    if (!query.trim()) {
      await fetchPHAData(page);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchTerm = query.toLowerCase().trim();
      console.log('🔍 Starting search for:', searchTerm);

      // First, let's see what data we actually have
      const { data: allData, error: allDataError } = await supabase
        .from('pha_agencies')
        .select('name, city, state, address')
        .limit(10);

      if (allDataError) {
        console.error('❌ Error fetching sample data:', allDataError);
      } else {
        console.log('📊 Sample database records:', allData);
      }

      // Now try a simple search on just names first
      const { data: nameSearch, error: nameError } = await supabase
        .from('pha_agencies')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      console.log('🏷️ Name search results:', {
        query: `%${searchTerm}%`,
        resultsCount: nameSearch?.length || 0,
        error: nameError,
        sampleResult: nameSearch?.[0]
      });

      // Try city search
      const { data: citySearch, error: cityError } = await supabase
        .from('pha_agencies')
        .select('*')
        .ilike('city', `%${searchTerm}%`);

      console.log('🏙️ City search results:', {
        query: `%${searchTerm}%`,
        resultsCount: citySearch?.length || 0,
        error: cityError,
        sampleResult: citySearch?.[0]
      });

      // Try state search
      const { data: stateSearch, error: stateError } = await supabase
        .from('pha_agencies')
        .select('*')
        .ilike('state', `%${searchTerm}%`);

      console.log('🏛️ State search results:', {
        query: `%${searchTerm}%`,
        resultsCount: stateSearch?.length || 0,
        error: stateError,
        sampleResult: stateSearch?.[0]
      });

      // Combine all results
      const allResults = [
        ...(nameSearch || []),
        ...(citySearch || []),
        ...(stateSearch || [])
      ];

      // Remove duplicates
      const uniqueResults = allResults.filter((item, index, arr) => 
        arr.findIndex(other => other.id === item.id) === index
      );

      console.log('🔄 Combined search results:', {
        totalBeforeDedup: allResults.length,
        totalAfterDedup: uniqueResults.length,
        finalResults: uniqueResults.slice(0, 3) // Show first 3 for debugging
      });

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const paginatedResults = uniqueResults.slice(from, to + 1);
      
      setPHAAgencies(paginatedResults);
      setTotalCount(uniqueResults.length);
      setCurrentPage(page);

    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to search PHA data');
      setPHAAgencies([]);
      setTotalCount(0);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };

  const getPHAsByState = async (state: string, page = 1) => {
    try {
      setLoading(true);
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error: fetchError, count } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact' })
        .eq('state', state.toUpperCase())
        .order('name')
        .range(from, to);

      if (fetchError) {
        throw fetchError;
      }

      setPHAAgencies(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching PHAs by state:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchPHAData(page);
  };

  useEffect(() => {
    fetchPHAData();
  }, []);

  return {
    phaAgencies,
    loading,
    error,
    currentPage,
    totalCount,
    itemsPerPage,
    totalPages: Math.ceil(totalCount / itemsPerPage),
    refetch: () => fetchPHAData(currentPage),
    searchPHAs,
    getPHAsByState,
    goToPage
  };
};
