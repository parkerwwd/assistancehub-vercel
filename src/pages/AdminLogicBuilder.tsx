import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import LogicBuilder from '@/components/LogicBuilder/LogicBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, ArrowLeft } from 'lucide-react';

export default function AdminLogicBuilder() {
  const { flowId } = useParams();
  const navigate = useNavigate();

  // Redirect to flow selection if no flowId provided
  useEffect(() => {
    if (!flowId) {
      // Could redirect to flow selection page or admin/flows
      // For now, show a selection interface
    }
  }, [flowId]);

  if (!flowId) {
    return (
      <AdminLayout 
        title="Logic Builder" 
        description="Select a flow to build advanced business rules and personalization"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Select a Flow</h3>
            <p className="text-gray-600 text-center mb-6">
              Logic Builder requires a specific flow to work with. Please select a flow from your flow list.
            </p>
            <Button onClick={() => navigate('/admin/flows')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Flow List
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Logic Builder" 
      description="Visual business rules and personalization engine"
    >
      <LogicBuilder flowId={flowId} />
    </AdminLayout>
  );
}
