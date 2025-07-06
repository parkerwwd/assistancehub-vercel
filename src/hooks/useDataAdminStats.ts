
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
  const [stats, setStats] = useState<DataAdminStats>({
    totalDataSources: 0,
    filesProcessed: 0,
    recordsManaged: 0,
    lastActivity: '',
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total PHA records
        const { count: phaCount } = await supabase
          .from('pha_agencies')
          .select('*', { count: 'exact', head: true });

        // Get recent audit log entries to determine files processed and last activity
        const { data: auditLogs } = await supabase
          .from('pha_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        // Calculate files processed (count of INSERT actions this month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const filesProcessedThisMonth = auditLogs?.filter(log => {
          const logDate = new Date(log.created_at);
          return log.action === 'INSERT' && 
                 logDate.getMonth() === currentMonth && 
                 logDate.getFullYear() === currentYear;
        }).length || 0;

        // Get last activity
        const lastActivityLog = auditLogs?.[0];
        let lastActivity = 'No recent activity';
        
        if (lastActivityLog) {
          const activityDate = new Date(lastActivityLog.created_at);
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
          
          if (diffInHours < 1) {
            lastActivity = 'Just now';
          } else if (diffInHours < 24) {
            lastActivity = `${diffInHours}h ago`;
          } else {
            const diffInDays = Math.floor(diffInHours / 24);
            lastActivity = `${diffInDays}d ago`;
          }
        }

        setStats({
          totalDataSources: 1, // Currently only PHA data source is active
          filesProcessed: filesProcessedThisMonth,
          recordsManaged: phaCount || 0,
          lastActivity,
          isLoading: false
        });

      } catch (error) {
        console.error('Error fetching data admin stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
