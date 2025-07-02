
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const usePHAData = () => {
  const [phaAgencies, setPHAAgencies] = useState<PHAAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPHAData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pha_agencies')
        .select('*')
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setPHAAgencies(data || []);
    } catch (err) {
      console.error('Error fetching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const searchPHAs = async (query: string) => {
    if (!query.trim()) {
      await fetchPHAData();
      return;
    }

    try {
      setLoading(true);
      const queryLower = query.toLowerCase().trim();

      const { data, error: searchError } = await supabase
        .from('pha_agencies')
        .select('*')
        .or(`name.ilike.%${queryLower}%,city.ilike.%${queryLower}%,state.ilike.%${queryLower}%,address.ilike.%${queryLower}%`)
        .order('name');

      if (searchError) {
        throw searchError;
      }

      setPHAAgencies(data || []);
    } catch (err) {
      console.error('Error searching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to search PHA data');
    } finally {
      setLoading(false);
    }
  };

  const getPHAsByState = async (state: string) => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('pha_agencies')
        .select('*')
        .eq('state', state.toUpperCase())
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setPHAAgencies(data || []);
    } catch (err) {
      console.error('Error fetching PHAs by state:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPHAData();
  }, []);

  return {
    phaAgencies,
    loading,
    error,
    refetch: fetchPHAData,
    searchPHAs,
    getPHAsByState
  };
};
