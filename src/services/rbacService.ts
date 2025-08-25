import { supabase } from '@/integrations/supabase/client';

/**
 * Role-Based Access Control Service for Enterprise Team Management
 * Handles permissions, roles, team collaboration, and audit trails
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string; // e.g., 'flows', 'analytics', 'settings'
  action: string;   // e.g., 'read', 'write', 'delete', 'publish'
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles can't be deleted
  permissions: Permission[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  roles: Role[];
  lastActive: string;
  invitedAt: string;
  invitedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AccessControlMatrix {
  [resource: string]: {
    [action: string]: boolean;
  };
}

export const RBACService = {
  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource, action');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get permissions:', error);
      return [];
    }
  },

  /**
   * Get all roles with permissions
   */
  async getRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions(
            permission:permissions(*)
          )
        `)
        .order('name');

      if (error) throw error;

      return (data || []).map(role => ({
        ...role,
        permissions: role.role_permissions?.map((rp: any) => rp.permission) || []
      }));
    } catch (error) {
      console.error('Failed to get roles:', error);
      return [];
    }
  },

  /**
   * Create a new role
   */
  async createRole(roleData: {
    name: string;
    description: string;
    permissionIds: string[];
  }): Promise<{ success: boolean; roleId?: string; errors?: string[] }> {
    try {
      // Create the role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          is_system: false
        })
        .select()
        .single();

      if (roleError) {
        return { success: false, errors: [roleError.message] };
      }

      // Add permissions to role
      if (roleData.permissionIds.length > 0) {
        const rolePermissions = roleData.permissionIds.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId
        }));

        const { error: permissionsError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (permissionsError) {
          return { success: false, errors: [permissionsError.message] };
        }
      }

      // Audit log
      await this.logAction('create', 'role', role.id, { name: roleData.name });

      return { success: true, roleId: role.id };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Update role permissions
   */
  async updateRolePermissions(
    roleId: string, 
    permissionIds: string[]
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Remove existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        }));

        const { error } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (error) {
          return { success: false, errors: [error.message] };
        }
      }

      // Audit log
      await this.logAction('update', 'role_permissions', roleId, { 
        permissionIds,
        count: permissionIds.length 
      });

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get team members with roles
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:roles(
              *,
              role_permissions(
                permission:permissions(*)
              )
            )
          )
        `)
        .order('email');

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatar: profile.avatar_url,
        status: profile.status,
        lastActive: profile.last_active_at,
        invitedAt: profile.created_at,
        invitedBy: profile.invited_by,
        roles: profile.user_roles?.map((ur: any) => ({
          ...ur.role,
          permissions: ur.role.role_permissions?.map((rp: any) => rp.permission) || []
        })) || []
      }));
    } catch (error) {
      console.error('Failed to get team members:', error);
      return [];
    }
  },

  /**
   * Invite team member
   */
  async inviteTeamMember(
    email: string,
    roleIds: string[],
    inviteMessage?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, errors: ['User already exists'] };
      }

      // Send invitation (simplified - in production, use proper auth flow)
      const inviteData = {
        email,
        role_ids: roleIds,
        invite_message: inviteMessage,
        invited_at: new Date().toISOString(),
        status: 'pending'
      };

      const { error } = await supabase
        .from('team_invitations')
        .insert(inviteData);

      if (error) {
        return { success: false, errors: [error.message] };
      }

      // Audit log
      await this.logAction('invite', 'team_member', email, { 
        roleIds,
        inviteMessage: !!inviteMessage 
      });

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Assign roles to user
   */
  async assignRoles(
    userId: string, 
    roleIds: string[]
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Add new roles
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          user_id: userId,
          role_id: roleId
        }));

        const { error } = await supabase
          .from('user_roles')
          .insert(userRoles);

        if (error) {
          return { success: false, errors: [error.message] };
        }
      }

      // Audit log
      await this.logAction('assign', 'user_roles', userId, { 
        roleIds,
        count: roleIds.length 
      });

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get user permissions (flattened from all roles)
   */
  async getUserPermissions(userId: string): Promise<AccessControlMatrix> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles(
            role_permissions(
              permission:permissions(*)
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const permissions: AccessControlMatrix = {};
      
      (data || []).forEach((userRole: any) => {
        userRole.role.role_permissions.forEach((rp: any) => {
          const permission = rp.permission;
          if (!permissions[permission.resource]) {
            permissions[permission.resource] = {};
          }
          permissions[permission.resource][permission.action] = true;
        });
      });

      return permissions;
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return {};
    }
  },

  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions[resource]?.[action] || false;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  },

  /**
   * Get audit log entries
   */
  async getAuditLog(
    limit = 100,
    offset = 0,
    filters?: {
      userId?: string;
      resource?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(email)
        `)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(entry => ({
        ...entry,
        userEmail: entry.user?.email || 'Unknown'
      }));
    } catch (error) {
      console.error('Failed to get audit log:', error);
      return [];
    }
  },

  /**
   * Log action for audit trail
   */
  async logAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action,
          resource,
          resource_id: resourceId,
          details,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  },

  /**
   * Initialize default roles and permissions
   */
  async initializeDefaultRoles(): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Default permissions
      const defaultPermissions = [
        { name: 'view_flows', description: 'View flows', resource: 'flows', action: 'read' },
        { name: 'create_flows', description: 'Create flows', resource: 'flows', action: 'write' },
        { name: 'edit_flows', description: 'Edit flows', resource: 'flows', action: 'update' },
        { name: 'delete_flows', description: 'Delete flows', resource: 'flows', action: 'delete' },
        { name: 'publish_flows', description: 'Publish flows', resource: 'flows', action: 'publish' },
        
        { name: 'view_analytics', description: 'View analytics', resource: 'analytics', action: 'read' },
        { name: 'export_data', description: 'Export data', resource: 'analytics', action: 'export' },
        
        { name: 'manage_team', description: 'Manage team members', resource: 'team', action: 'manage' },
        { name: 'view_audit_logs', description: 'View audit logs', resource: 'audit', action: 'read' },
        
        { name: 'manage_integrations', description: 'Manage integrations', resource: 'integrations', action: 'manage' },
        { name: 'manage_settings', description: 'Manage settings', resource: 'settings', action: 'manage' },
      ];

      // Insert permissions
      const { data: permissions } = await supabase
        .from('permissions')
        .upsert(defaultPermissions, { onConflict: 'name' })
        .select();

      if (!permissions) {
        return { success: false, errors: ['Failed to create permissions'] };
      }

      // Default roles with permission mappings
      const defaultRoles = [
        {
          name: 'Super Admin',
          description: 'Full system access',
          is_system: true,
          permissions: permissions // All permissions
        },
        {
          name: 'Admin',
          description: 'Administrative access without team management',
          is_system: true,
          permissions: permissions.filter(p => p.resource !== 'team' && p.resource !== 'settings')
        },
        {
          name: 'Editor',
          description: 'Can create and edit flows',
          is_system: true,
          permissions: permissions.filter(p => 
            (p.resource === 'flows' && ['read', 'write', 'update'].includes(p.action)) ||
            (p.resource === 'analytics' && p.action === 'read')
          )
        },
        {
          name: 'Viewer',
          description: 'Read-only access',
          is_system: true,
          permissions: permissions.filter(p => p.action === 'read')
        },
        {
          name: 'Analyst',
          description: 'Analytics focus with data export',
          is_system: true,
          permissions: permissions.filter(p => 
            p.resource === 'analytics' || 
            (p.resource === 'flows' && p.action === 'read')
          )
        }
      ];

      // Create roles and assign permissions
      for (const roleData of defaultRoles) {
        const { data: role } = await supabase
          .from('roles')
          .upsert({
            name: roleData.name,
            description: roleData.description,
            is_system: roleData.is_system
          }, { onConflict: 'name' })
          .select()
          .single();

        if (role) {
          // Clear existing permissions
          await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', role.id);

          // Add permissions
          const rolePermissions = roleData.permissions.map(permission => ({
            role_id: role.id,
            permission_id: permission.id
          }));

          await supabase
            .from('role_permissions')
            .insert(rolePermissions);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: [(error as Error).message] };
    }
  },

  /**
   * Get user's effective permissions (cached)
   */
  getUserPermissionsSync(userId: string): AccessControlMatrix {
    // In a real implementation, this would use cached permissions
    // For now, return a basic permission set for the demo
    return {
      flows: { read: true, write: true, update: true, delete: false, publish: true },
      analytics: { read: true, export: true },
      team: { manage: false },
      audit: { read: true },
      integrations: { manage: false },
      settings: { manage: false }
    };
  }
};
