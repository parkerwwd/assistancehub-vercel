import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import ABTestManager from '@/components/ABTesting/ABTestManager';

export default function AdminABTesting() {
  return (
    <AdminLayout 
      title="A/B Testing" 
      description="Statistical testing and conversion optimization"
    >
      <ABTestManager />
    </AdminLayout>
  );
}
