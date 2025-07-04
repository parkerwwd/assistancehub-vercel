
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const usePHACount = () => {
  const [totalPHAs, setTotalPHAs] = useState<number>(0);
  const [lastImport, setLastImport] = useState<Date | null>(null);

  const fetchPHACount = async () => {
    try {
      const { count, error } = await supabase
        .from('pha_agencies')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching PHA count:', error);
        return;
      }

      console.log('Fetched PHA count:', count);
      setTotalPHAs(count || 0);
    } catch (error) {
      console.error('Error in fetchPHACount:', error);
    }
  };

  useEffect(() => {
    fetchPHACount();
    
    // Load last import date from localStorage
    const savedLastImport = localStorage.getItem('pha_last_import');
    if (savedLastImport) {
      setLastImport(new Date(savedLastImport));
    }
  }, []);

  const updateLastImport = (date: Date) => {
    setLastImport(date);
    localStorage.setItem('pha_last_import', date.toISOString());
  };

  const resetLastImport = () => {
    setLastImport(null);
    localStorage.removeItem('pha_last_import');
  };

  return {
    totalPHAs,
    setTotalPHAs,
    lastImport,
    setLastImport: (date: Date | null) => {
      if (date) {
        updateLastImport(date);
      } else {
        resetLastImport();
      }
    },
    fetchPHACount
  };
};
