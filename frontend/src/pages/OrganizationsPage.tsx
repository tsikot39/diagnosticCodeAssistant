import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Plus, Trash2, Edit, Users, Code, TrendingUp, Building2, Power, PowerOff } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  is_active: boolean;
  max_users: number;
  max_codes: number;
  created_at: string;
  updated_at: string;
}

interface OrgStats {
  organization_id: number;
  user_count: number;
  code_count: number;
  active_user_count: number;
  inactive_code_count: number;
  max_users: number;
  max_codes: number;
  users_remaining: number;
  codes_remaining: number;
}

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    max_users: 10,
    max_codes: 10000,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/organizations/');
      setOrganizations(Array.isArray(response.data) ? response.data : response.data.organizations || []);
    } catch (error: any) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (orgId: number) => {
    try {
      const response = await api.get(`/api/v1/organizations/${orgId}/stats`);
      setStats(response.data);
    } catch (error: any) {
      toast.error('Failed to load statistics');
    }
  };

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    fetchStats(org.id);
  };

  const handleCreateOrg = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      await api.post('/api/v1/organizations', formData);
      toast.success('Organization created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create organization');
    }
  };

  const handleUpdateOrg = async () => {
    if (!selectedOrg) return;

    try {
      await api.put(`/api/v1/organizations/${selectedOrg.id}`, {
        name: formData.name,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        max_users: formData.max_users,
        max_codes: formData.max_codes,
      });
      toast.success('Organization updated successfully');
      setIsEditModalOpen(false);
      fetchOrganizations();
      if (selectedOrg) {
        fetchStats(selectedOrg.id);
      }
    } catch (error: any) {
      toast.error('Failed to update organization');
    }
  };

  const handleToggleActive = async (org: Organization) => {
    try {
      await api.put(`/api/v1/organizations/${org.id}`, { is_active: !org.is_active });
      toast.success(`Organization ${!org.is_active ? 'activated' : 'deactivated'}`);
      fetchOrganizations();
    } catch (error: any) {
      toast.error('Failed to update organization');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete organization "${name}"? This will delete ALL associated users and codes!`)) {
      return;
    }

    try {
      await api.delete(`/api/v1/organizations/${id}`);
      toast.success('Organization deleted');
      fetchOrganizations();
      if (selectedOrg?.id === id) {
        setSelectedOrg(null);
        setStats(null);
      }
    } catch (error: any) {
      toast.error('Failed to delete organization');
    }
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || '',
      email: org.email || '',
      phone: org.phone || '',
      website: org.website || '',
      max_users: org.max_users,
      max_codes: org.max_codes,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      max_users: 10,
      max_codes: 10000,
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage multi-tenant organizations</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">All Organizations</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className={`cursor-pointer transition-all ${
                    selectedOrg?.id === org.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectOrg(org)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4" />
                          <h3 className="font-semibold">{org.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">/{org.slug}</p>
                        <div className="flex gap-2">
                          <Badge variant={org.is_active ? 'default' : 'secondary'}>
                            {org.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(org);
                          }}
                          className="h-7 px-2"
                        >
                          {org.is_active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(org);
                          }}
                          className="h-7 px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(org.id, org.name);
                          }}
                          className="h-7 px-2 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Organization Details & Stats */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedOrg ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500">Select an organization to view details</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Organization Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-lg">{selectedOrg.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Slug</p>
                      <p className="text-lg font-mono">/{selectedOrg.slug}</p>
                    </div>
                    {selectedOrg.email && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p>{selectedOrg.email}</p>
                      </div>
                    )}
                    {selectedOrg.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p>{selectedOrg.phone}</p>
                      </div>
                    )}
                    {selectedOrg.website && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Website</p>
                        <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedOrg.website}
                        </a>
                      </div>
                    )}
                    {selectedOrg.description && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p>{selectedOrg.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.user_count} / {stats.max_users}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.active_user_count} active • {stats.users_remaining} slots remaining
                      </p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(stats.user_count / stats.max_users) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Diagnostic Codes</CardTitle>
                      <Code className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.code_count} / {stats.max_codes}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.code_count - stats.inactive_code_count} active • {stats.codes_remaining} remaining
                      </p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${(stats.code_count / stats.max_codes) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Organization Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization with isolated data and user management
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                }}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (URL-friendly) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="acme-corp"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://acme.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_users">Max Users</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_users}
                  onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_codes">Max Codes</Label>
                <Input
                  id="max_codes"
                  type="number"
                  min="1"
                  max="1000000"
                  value={formData.max_codes}
                  onChange={(e) => setFormData({ ...formData, max_codes: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrg}>Create Organization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details and limits</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-max-users">Max Users</Label>
                <Input
                  id="edit-max-users"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_users}
                  onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-max-codes">Max Codes</Label>
                <Input
                  id="edit-max-codes"
                  type="number"
                  min="1"
                  max="1000000"
                  value={formData.max_codes}
                  onChange={(e) => setFormData({ ...formData, max_codes: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrg}>Update Organization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
