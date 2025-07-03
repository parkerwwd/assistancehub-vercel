
import { useState, useEffect } from 'react';
import { Database } from "@/integrations/supabase/types";
import { fetchPHAData } from "@/services/phaService";
import { GeocodedPHA } from "@/services/geocodingService";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

export const usePHAData = () => {
  const [phaAgencies, setPHAAgencies] = useState<GeocodedPHA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const handleFetchPHAData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchPHAData(page, itemsPerPage);
      
      setPHAAgencies(result.data);
      setTotalCount(result.count);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ Error fetching PHA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch PHA data');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    handleFetchPHAData(page);
  };

  useEffect(() => {
    handleFetchPHAData();
  }, []);

  return {
    phaAgencies,
    loading,
    error,
    currentPage,
    totalCount,
    itemsPerPage,
    totalPages: Math.ceil(totalCount / itemsPerPage),
    refetch: () => handleFetchPHAData(currentPage),
    goToPage
  };
};
