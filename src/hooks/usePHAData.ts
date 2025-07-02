
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
      
      const searchTerm = query.toLowerCase().trim();
      console.log('Raw search query:', query);
      console.log('Processed search term:', searchTerm);

      // First, let's see what data we have
      const { data: sampleData } = await supabase
        .from('pha_agencies')
        .select('name, city, state, address')
        .limit(5);
      
      console.log('Sample data from database:', sampleData);

      // Try a simple direct search first
      const { data, error: searchError, count } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('name')
        .range(0, 19);

      if (searchError) {
        console.error('Search error:', searchError);
        throw searchError;
      }

      console.log('Search results:', data);
      console.log('Search results count:', data?.length || 0);
      
      setPHAAgencies(data || []);
      setTotalCount(count || 0);
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
