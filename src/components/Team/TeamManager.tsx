import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import {
  Users, UserPlus, Shield, Settings, Eye, Edit, Trash2, Mail,
  Check, X, Clock, AlertTriangle, Key, History, Plus
} from 'lucide-react';
import { RBACService, Role, TeamMember, Permission, AuditLogEntry } from '@/services/rbacService';
import { toast } from '@/hooks/use-toast';

interface TeamManagerProps {
  className?: string;
}

export default function TeamManager({ className }: TeamManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    roleIds: [] as string[],
    message: ''
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData, teamData, auditData] = await Promise.all([
        RBACService.getRoles(),
        RBACService.getPermissions(),
        RBACService.getTeamMembers(),
        RBACService.getAuditLog(50)
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
      setTeamMembers(teamData);
      setAuditLog(auditData);
    } catch (error) {
      console.error('Failed to load team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteUser = async () => {
    try {
      if (!inviteForm.email || inviteForm.roleIds.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please provide email and at least one role",
          variant: "destructive"
        });
        return;
      }

      const result = await RBACService.inviteTeamMember(
        inviteForm.email,
        inviteForm.roleIds,
        inviteForm.message
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "Team member invited successfully"
        });
        setShowInviteDialog(false);
        setInviteForm({ email: '', roleIds: [], message: '' });
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(', ') || "Failed to invite team member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast({
        title: "Error",
        description: "Failed to invite team member",
        variant: "destructive"
      });
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.name || roleForm.permissionIds.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please provide role name and at least one permission",
          variant: "destructive"
        });
        return;
      }

      const result = editingRole
        ? await RBACService.updateRolePermissions(editingRole.id, roleForm.permissionIds)
        : await RBACService.createRole(roleForm);

      if (result.success) {
        toast({
          title: "Success",
          description: editingRole ? "Role updated successfully" : "Role created successfully"
        });
        setShowRoleDialog(false);
        setRoleForm({ name: '', description: '', permissionIds: [] });
        setEditingRole(null);
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(', ') || "Failed to save role",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive"
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map(p => p.id)
    });
    setShowRoleDialog(true);
  };

  const handleAssignRoles = async (memberId: string, roleIds: string[]) => {
    const result = await RBACService.assignRoles(memberId, roleIds);
    if (result.success) {
      toast({ title: "Success", description: "Roles updated successfully" });
      loadData();
    } else {
      toast({
        title: "Error",
        description: result.errors?.join(', ') || "Failed to update roles",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return <Check className="w-4 h-4 text-green-600" />;
      case 'inactive': return <X className="w-4 h-4 text-gray-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatPermissionName = (permission: Permission) => {
    return `${permission.resource}:${permission.action}`;
  };

  const groupPermissionsByResource = (perms: Permission[]) => {
    const groups: Record<string, Permission[]> = {};
    perms.forEach(perm => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = [];
      }
      groups[perm.resource].push(perm);
    });
    return groups;
  };

  const permissionGroups = groupPermissionsByResource(permissions);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading team data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage team members, roles, and permissions</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setEditingRole(null);
                setRoleForm({ name: '', description: '', permissionIds: [] });
              }}>
                <Shield className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role-name">Role Name *</Label>
                    <Input
                      id="role-name"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                      placeholder="e.g., Content Editor"
                      disabled={editingRole?.isSystem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-desc">Description</Label>
                    <Input
                      id="role-desc"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                      placeholder="Brief description of this role"
                      disabled={editingRole?.isSystem}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Permissions</Label>
                  <div className="mt-3 space-y-4 max-h-80 overflow-y-auto">
                    {Object.entries(permissionGroups).map(([resource, perms]) => (
                      <Card key={resource} className="p-4">
                        <h4 className="font-medium mb-3 capitalize text-blue-700">
                          {resource.replace('_', ' ')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Switch
                                id={`perm-${permission.id}`}
                                checked={roleForm.permissionIds.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRoleForm({
                                      ...roleForm,
                                      permissionIds: [...roleForm.permissionIds, permission.id]
                                    });
                                  } else {
                                    setRoleForm({
                                      ...roleForm,
                                      permissionIds: roleForm.permissionIds.filter(id => id !== permission.id)
                                    });
                                  }
                                }}
                              />
                              <Label 
                                htmlFor={`perm-${permission.id}`} 
                                className="text-sm cursor-pointer"
                              >
                                {permission.action}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowRoleDialog(false);
                    setEditingRole(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole}>
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    placeholder="teammate@company.com"
                  />
                </div>

                <div>
                  <Label>Assign Roles *</Label>
                  <div className="mt-2 space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Switch
                          id={`role-${role.id}`}
                          checked={inviteForm.roleIds.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInviteForm({
                                ...inviteForm,
                                roleIds: [...inviteForm.roleIds, role.id]
                              });
                            } else {
                              setInviteForm({
                                ...inviteForm,
                                roleIds: inviteForm.roleIds.filter(id => id !== role.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{role.description}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="invite-message">Welcome Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                    placeholder="Welcome to the team! You'll have access to..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteUser}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members Yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Start building your team by inviting members
                </p>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite First Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {getInitials(member.firstName, member.lastName, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {member.firstName && member.lastName 
                                ? `${member.firstName} ${member.lastName}`
                                : member.email
                              }
                            </h3>
                            <Badge className={getStatusColor(member.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(member.status)}
                                {member.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.roles.map((role) => (
                              <Badge key={role.id} variant="secondary" className="text-xs">
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-500">
                          <div>Last active:</div>
                          <div>{new Date(member.lastActive).toLocaleDateString()}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <Badge variant="outline">System Role</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {role.userCount || 0} member{(role.userCount || 0) !== 1 ? 's' : ''}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Permissions:</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {formatPermissionName(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>
                Available permissions grouped by resource type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionGroups).map(([resource, perms]) => (
                  <div key={resource}>
                    <h3 className="font-medium mb-3 capitalize text-blue-700">
                      {resource.replace('_', ' ')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((permission) => (
                        <div key={permission.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{permission.action}</div>
                          <div className="text-sm text-gray-600">{permission.description}</div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Audit Log</CardTitle>
              <CardDescription>
                Track all team management activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No audit log entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{entry.userEmail}</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                          <span className="text-gray-500">{entry.resource}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.details && (
                          <div className="text-xs text-gray-600 mt-1">
                            {JSON.stringify(entry.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
