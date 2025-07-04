
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const usePHACount = () => {
  const [totalPHAs, setTotalPHAs] = useState<number>(0);
  const [lastImport, setLastImport] = useState<Date | null>(null);

  // Fetch current count of PHAs in database
  const fetchPHACount = async () => {
    try {
      const { count, error } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalPHAs(count || 0);
    } catch (error) {
      console.error('Error fetching PHA count:', error);
    }
  };

  useEffect(() => {
    fetchPHACount();
  }, []);

  return {
    totalPHAs,
    lastImport,
    setLastImport,
    fetchPHACount
  };
};
