
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
      const searchTerm = query.toLowerCase().trim();
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      console.log('Searching for:', searchTerm);

      // Use multiple separate queries and combine results to avoid PostgREST parsing issues
      const searchQueries = [
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('name', `%${searchTerm}%`)
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('city', `%${searchTerm}%`)
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('state', `%${searchTerm}%`)
          .range(from, to),
        supabase
          .from('pha_agencies')
          .select('*', { count: 'exact' })
          .ilike('address', `%${searchTerm}%`)
          .range(from, to)
      ];

      const results = await Promise.allSettled(searchQueries);
      
      // Combine all successful results and remove duplicates
      const allData: PHAAgency[] = [];
      const seenIds = new Set<string>();
      let totalCountResult = 0;

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data) {
          result.value.data.forEach((agency) => {
            if (!seenIds.has(agency.id)) {
              seenIds.add(agency.id);
              allData.push(agency);
            }
          });
          // Use the highest count from all queries
          if (result.value.count && result.value.count > totalCountResult) {
            totalCountResult = result.value.count;
          }
        }
      });

      // Sort results by name
      allData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      console.log('Search results:', allData.length, 'total count:', totalCountResult);
      
      setPHAAgencies(allData);
      setTotalCount(totalCountResult);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error searching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to search PHA data');
      
      // If search fails, fall back to fetching all data
      console.log('Falling back to fetch all PHA data');
      await fetchPHAData(page);
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
