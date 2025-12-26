import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { Loader2, Trash2, Edit, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    if ((user as any)?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/users');
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { data } = await apiClient.put(
        `/api/v1/users/${selectedUser.id}/role?role=${newRole}`
      );
      toast.success(`Updated ${selectedUser.username}'s role to ${newRole}`);
      setUsers(users.map(u => u.id === selectedUser.id ? data : u));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/users/${userId}`);
      toast.success(`Deleted user ${username}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if ((user as any)?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.full_name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {u.role.toUpperCase()}
                      </Badge>
                      {u.is_superuser && (
                        <Badge className="ml-1 bg-yellow-100 text-yellow-800">
                          SUPERUSER
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(u)}
                          disabled={u.id === user?.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={u.id === user?.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                  <SelectItem value="user">User (Read + Write)</SelectItem>
                  <SelectItem value="manager">Manager (User + Team Management)</SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge className={getRoleBadgeColor('viewer')}>VIEWER</Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Read-only access to diagnostic codes. Cannot create, edit, or delete.
                </p>
              </div>
              <div>
                <Badge className={getRoleBadgeColor('user')}>USER</Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Can view and manage diagnostic codes. Default role for new users.
                </p>
              </div>
              <div>
                <Badge className={getRoleBadgeColor('manager')}>MANAGER</Badge>
                <p className="text-sm text-gray-600 mt-1">
                  User permissions plus ability to manage team members and view team analytics.
                </p>
              </div>
              <div>
                <Badge className={getRoleBadgeColor('admin')}>ADMIN</Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Full system access including user management, audit logs, and system configuration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
