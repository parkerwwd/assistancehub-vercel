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

      setPHAAgencies(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching PHA data:', err);
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
      
      const searchTerm = `%${query.toLowerCase().trim()}%`;
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      console.log('Searching for:', searchTerm);
      console.log('Query range:', from, 'to', to);

      // Use individual queries and combine results to avoid PostgREST parsing issues
      const [nameResults, cityResults, stateResults, addressResults] = await Promise.all([
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('name', searchTerm)
          .order('name')
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('city', searchTerm)
          .order('name')
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('state', searchTerm)
          .order('name')
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('address', searchTerm)
          .order('name')
          .range(from, to)
      ]);

      // Check for errors
      const errors = [nameResults.error, cityResults.error, stateResults.error, addressResults.error].filter(Boolean);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Combine and deduplicate results
      const allResults = [
        ...(nameResults.data || []),
        ...(cityResults.data || []),
        ...(stateResults.data || []),
        ...(addressResults.data || [])
      ];

      // Remove duplicates by ID
      const uniqueResults = allResults.filter((item, index, arr) => 
        arr.findIndex(other => other.id === item.id) === index
      );

      // Sort by name
      uniqueResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      console.log('Search query executed successfully');
      console.log('Combined search results count:', uniqueResults.length);
      
      setPHAAgencies(uniqueResults);
      setTotalCount(uniqueResults.length);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error searching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to search PHA data');
      
      // Show empty results instead of falling back to all data
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
