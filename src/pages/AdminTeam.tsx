import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import TeamManager from '@/components/Team/TeamManager';

export default function AdminTeam() {
  return (
    <AdminLayout 
      title="Team Management" 
      description="User roles, permissions, and team collaboration"
    >
      <TeamManager />
    </AdminLayout>
  );
}
