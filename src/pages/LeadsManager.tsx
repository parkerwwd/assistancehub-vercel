import React, { useState, useEffect } from 'react';
import { Download, Filter, Mail, Phone, Calendar, MapPin, ExternalLink, Search, Database, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Lead, Flow } from '@/types/leadFlow';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LeadsManager() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadResponses, setLeadResponses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load flows for filter dropdown
      const { data: flowsData } = await supabase
        .from('flows')
        .select('id, name, slug');
      
      if (flowsData) setFlows(flowsData);

      // Load leads with flow information
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select(`
          *,
          flow:flows(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (leadsData) setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error",
        description: "Could not load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeadResponses = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_responses')
        .select(`
          *,
          field:flow_fields(label, field_type)
        `)
        .eq('lead_id', leadId);

      if (error) throw error;
      if (data) setLeadResponses(data);
    } catch (error) {
      console.error('Error loading lead responses:', error);
    }
  };

  const handleViewDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    await loadLeadResponses(lead.id);
  };

  const handleExportLeads = () => {
    const filteredLeads = getFilteredLeads();
    
    // Create CSV content
    const headers = ['Date', 'Name', 'Email', 'Phone', 'ZIP', 'Flow', 'Status', 'Source', 'Campaign'];
    const rows = filteredLeads.map(lead => [
      format(new Date(lead.created_at), 'MM/dd/yyyy'),
      `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'N/A',
      lead.email || 'N/A',
      lead.phone || 'N/A',
      lead.zip_code || 'N/A',
      (lead as any).flow?.name || 'N/A',
      lead.status || 'new',
      lead.utm_source || 'direct',
      lead.utm_campaign || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${filteredLeads.length} leads to CSV`,
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: "Success",
        description: "Lead status updated",
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Could not update lead status",
        variant: "destructive",
      });
    }
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      
      const matchesFlow = selectedFlow === 'all' || lead.flow_id === selectedFlow;
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;

      return matchesSearch && matchesFlow && matchesStatus;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'qualified':
        return 'bg-green-500';
      case 'contacted':
        return 'bg-yellow-500';
      case 'converted':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredLeads = getFilteredLeads();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-2">Manage and export your captured leads</p>
          </div>
          <Button onClick={handleExportLeads} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/data-admin')}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Data Import
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/flows')}
            className="flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            Lead Flows
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            disabled
          >
            <Users className="w-4 h-4" />
            Leads
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">New This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(l => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(l.created_at) > weekAgo;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Qualified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(l => l.status === 'qualified').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Converted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(l => l.status === 'converted').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedFlow} onValueChange={setSelectedFlow}>
                <SelectTrigger>
                  <SelectValue placeholder="All Flows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Flows</SelectItem>
                  {flows.map(flow => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                {filteredLeads.length} of {leads.length} leads
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No leads found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Flow</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(lead.created_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {lead.first_name || lead.last_name 
                            ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                            : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                {lead.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.zip_code && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {lead.zip_code}
                            {lead.city && `, ${lead.city}`}
                            {lead.state && `, ${lead.state}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(lead as any).flow?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>{lead.utm_source || 'direct'}</div>
                          {lead.utm_campaign && (
                            <div className="text-gray-500">{lead.utm_campaign}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status || 'new'}
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={`${getStatusColor(lead.status || 'new')} text-white`}>
                              {lead.status || 'new'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(lead)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Full information and responses for this lead
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">
                    {selectedLead.first_name || selectedLead.last_name 
                      ? `${selectedLead.first_name || ''} ${selectedLead.last_name || ''}`.trim()
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <p className="font-medium">{selectedLead.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedLead.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Location</Label>
                  <p className="font-medium">
                    {selectedLead.zip_code || 'Not provided'}
                    {selectedLead.city && `, ${selectedLead.city}`}
                    {selectedLead.state && `, ${selectedLead.state}`}
                  </p>
                </div>
              </div>

              {/* Source Information */}
              <div>
                <h4 className="font-semibold mb-2">Source Information</h4>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span>{selectedLead.utm_source || 'direct'}</span>
                  </div>
                  {selectedLead.utm_campaign && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Campaign:</span>
                      <span>{selectedLead.utm_campaign}</span>
                    </div>
                  )}
                  {selectedLead.utm_medium && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium:</span>
                      <span>{selectedLead.utm_medium}</span>
                    </div>
                  )}
                  {selectedLead.gclid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Google Click ID:</span>
                      <span className="font-mono text-xs">{selectedLead.gclid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Responses */}
              {leadResponses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Form Responses</h4>
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    {leadResponses.map((response, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">
                          {response.field?.label || response.field_name}:
                        </span>
                        <span className="font-medium">
                          {response.field_value || response.field_values || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{format(new Date(selectedLead.created_at), 'PPp')}</span>
                  </div>
                  {selectedLead.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span>{format(new Date(selectedLead.completed_at), 'PPp')}</span>
                    </div>
                  )}
                  {selectedLead.time_to_complete && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time to Complete:</span>
                      <span>{Math.round(selectedLead.time_to_complete / 60)} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}