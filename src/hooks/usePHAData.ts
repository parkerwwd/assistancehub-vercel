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
      console.log('Searching for:', searchTerm);

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Use multiple individual searches and combine results
      const searchPromises = [
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('name', `%${searchTerm}%`),
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('city', `%${searchTerm}%`),
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('state', `%${searchTerm}%`),
        supabase
          .from('pha_agencies')
          .select('*')
          .ilike('address', `%${searchTerm}%`)
      ];

      const results = await Promise.all(searchPromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        const firstError = results.find(result => result.error)?.error;
        throw firstError;
      }

      // Combine all results and remove duplicates
      const allResults: PHAAgency[] = [];
      results.forEach(result => {
        if (result.data) {
          allResults.push(...result.data);
        }
      });

      // Remove duplicates by ID
      const uniqueResults = allResults.filter((item, index, arr) => 
        arr.findIndex(other => other.id === item.id) === index
      );

      // Sort by name
      uniqueResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      // Apply pagination to the combined results
      const paginatedResults = uniqueResults.slice(from, to + 1);
      
      console.log('Search completed. Total unique results:', uniqueResults.length);
      console.log('Paginated results:', paginatedResults.length);
      
      setPHAAgencies(paginatedResults);
      setTotalCount(uniqueResults.length);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error searching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to search PHA data');
      
      // Show empty results on error
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
