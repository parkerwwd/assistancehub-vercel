
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

  const clearAllPHAData = async () => {
    try {
      console.log('🗑️ Clearing all PHA data from database...');
      const { error } = await supabase
        .from('pha_agencies')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records (using impossible condition to delete all)

      if (error) {
        console.error('❌ Error clearing PHA data:', error);
        throw error;
      }

      console.log('✅ Successfully cleared all PHA data from database');
      setTotalPHAs(0);
    } catch (error) {
      console.error('Error in clearAllPHAData:', error);
      throw error;
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
    fetchPHACount,
    clearAllPHAData
  };
};
