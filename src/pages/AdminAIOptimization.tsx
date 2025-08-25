import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AIOptimizationDashboard from '@/components/AIOptimization/AIOptimizationDashboard';

export default function AdminAIOptimization() {
  const { flowId } = useParams();

  return (
    <AdminLayout 
      title="AI Optimization Suite" 
      description="Machine learning insights and automated optimization recommendations"
    >
      <AIOptimizationDashboard flowId={flowId} />
    </AdminLayout>
  );
}
