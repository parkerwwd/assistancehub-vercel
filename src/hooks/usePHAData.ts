
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

  // Enhanced input sanitization for search queries
  const sanitizeSearchInput = (input: string): string => {
    return input
      .replace(/[<>\"']/g, '') // Remove HTML/script injection characters
      .replace(/\0/g, '') // Remove null bytes
      .trim()
      .substring(0, 100); // Limit search query length
  };

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
      
      // Sanitize search input to prevent injection attacks
      const searchTerm = sanitizeSearchInput(query.toLowerCase());
      console.log('🔍 Starting search for:', searchTerm);

      // Enhanced search with rate limiting considerations
      const searchPromises = [
        // Name search
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .limit(100), // Limit results to prevent excessive resource usage

        // City search
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('city', `%${searchTerm}%`)
          .limit(100),

        // State search
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('state', `%${searchTerm}%`)
          .limit(100)
      ];

      const [nameResults, cityResults, stateResults] = await Promise.all(searchPromises);

      // Log individual search results for debugging
      console.log('🏷️ Name search results:', {
        query: `%${searchTerm}%`,
        resultsCount: nameResults.data?.length || 0,
        error: nameResults.error
      });

      console.log('🏙️ City search results:', {
        query: `%${searchTerm}%`,
        resultsCount: cityResults.data?.length || 0,
        error: cityResults.error
      });

      console.log('🏛️ State search results:', {
        query: `%${searchTerm}%`,
        resultsCount: stateResults.data?.length || 0,
        error: stateResults.error
      });

      // Check for errors in any of the searches
      if (nameResults.error || cityResults.error || stateResults.error) {
        throw new Error('Search failed due to database error');
      }

      // Combine all results
      const allResults = [
        ...(nameResults.data || []),
        ...(cityResults.data || []),
        ...(stateResults.data || [])
      ];

      // Remove duplicates based on ID
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
      const sanitizedState = sanitizeSearchInput(state);
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error: fetchError, count } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact' })
        .eq('state', sanitizedState.toUpperCase())
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
