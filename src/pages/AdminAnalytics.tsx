import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';

export default function AdminAnalytics() {
  const { flowId } = useParams();

  return (
    <AdminLayout 
      title="Analytics Dashboard" 
      description="Conversion funnels, real-time metrics, and performance insights"
    >
      <AnalyticsDashboard flowId={flowId} />
    </AdminLayout>
  );
}
