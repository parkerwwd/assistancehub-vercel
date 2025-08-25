import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import IntegrationHub from '@/components/Integrations/IntegrationHub';

export default function AdminIntegrations() {
  return (
    <AdminLayout 
      title="Integration Hub" 
      description="CRM integrations, webhooks, and third-party connections"
    >
      <IntegrationHub />
    </AdminLayout>
  );
}
