
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Eye, EyeOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditLogEntry {
  id: string;
  table_name: string;
  action: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  user_id: string | null;
  ip_address: unknown | null;
  user_agent: string | null;
  created_at: string;
}

export const AuditLogViewer: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pha_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return 'N/A';
    return JSON.stringify(data, null, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading audit logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Audit Log (Last 50 Changes)
          </CardTitle>
          <Button
            onClick={fetchAuditLogs}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No audit log entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.record_id || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => toggleDetails(log.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {showDetails[log.id] ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Show
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {showDetails[log.id] && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                            {log.old_data && (
                              <div>
                                <h5 className="font-semibold text-sm mb-2 text-red-700">
                                  Old Data:
                                </h5>
                                <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-40 border">
                                  {formatJsonData(log.old_data)}
                                </pre>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <h5 className="font-semibold text-sm mb-2 text-green-700">
                                  New Data:
                                </h5>
                                <pre className="bg-green-50 p-3 rounded text-xs overflow-auto max-h-40 border">
                                  {formatJsonData(log.new_data)}
                                </pre>
                              </div>
                            )}
                            {log.ip_address && (
                              <div className="lg:col-span-2">
                                <h5 className="font-semibold text-sm mb-1">Additional Info:</h5>
                                <p className="text-xs text-gray-600">
                                  IP: {String(log.ip_address)}
                                  {log.user_agent && ` | User Agent: ${log.user_agent}`}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
