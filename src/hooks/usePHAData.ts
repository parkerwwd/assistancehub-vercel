
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

      // Use individual queries and combine results
      const searchQueries = [
        supabase.from('pha_agencies').select('*', { count: 'exact' }).ilike('name', `%${searchTerm}%`),
        supabase.from('pha_agencies').select('*', { count: 'exact' }).ilike('city', `%${searchTerm}%`),
        supabase.from('pha_agencies').select('*', { count: 'exact' }).ilike('state', `%${searchTerm}%`),
        supabase.from('pha_agencies').select('*', { count: 'exact' }).ilike('address', `%${searchTerm}%`)
      ];

      const results = await Promise.all(searchQueries);
      
      // Combine and deduplicate results
      const allResults: PHAAgency[] = [];
      const seenIds = new Set<string>();
      
      results.forEach(({ data }) => {
        if (data) {
          data.forEach((agency: PHAAgency) => {
            if (!seenIds.has(agency.id)) {
              seenIds.add(agency.id);
              allResults.push(agency);
            }
          });
        }
      });

      // Sort by name and apply pagination
      const sortedResults = allResults.sort((a, b) => a.name.localeCompare(b.name));
      const paginatedResults = sortedResults.slice(from, to + 1);
      
      setPHAAgencies(paginatedResults);
      setTotalCount(sortedResults.length);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error searching PHA data:', err);
      
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
