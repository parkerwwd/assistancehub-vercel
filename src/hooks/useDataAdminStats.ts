
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface DataAdminStats {
  totalDataSources: number;
  filesProcessed: number;
  recordsManaged: number;
  lastActivity: string;
  isLoading: boolean;
}

export const useDataAdminStats = () => {
  const [totalDataSources, setTotalDataSources] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [recordsManaged, setRecordsManaged] = useState(0);
  const [phasWithoutCoordinates, setPhasWithoutCoordinates] = useState(0);
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch files uploaded
        const { count: filesCount } = await supabase
          .from('pha_audit_log')
          .select('*', { count: 'exact', head: true })
          .eq('table_name', 'pha_agencies')
          .eq('action', 'INSERT');

        // Fetch total PHA records
        const { count: phaCount } = await supabase
          .from('pha_agencies')
          .select('*', { count: 'exact', head: true });

        // Fetch PHAs without coordinates
        const { count: noCoordCount } = await supabase
          .from('pha_agencies')
          .select('*', { count: 'exact', head: true })
          .or('latitude.is.null,longitude.is.null');

        // Fetch last activity
        const { data: lastActivityData } = await supabase
          .from('pha_audit_log')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setFilesProcessed(filesCount || 0);
        setRecordsManaged(phaCount || 0);
        setPhasWithoutCoordinates(noCoordCount || 0);
        setTotalDataSources(1); // We have one data source - the CSV upload
        
        if (lastActivityData?.created_at) {
          setLastActivity(new Date(lastActivityData.created_at).toLocaleString());
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    totalDataSources,
    filesProcessed,
    recordsManaged,
    phasWithoutCoordinates,
    lastActivity,
    isLoading
  };
};
