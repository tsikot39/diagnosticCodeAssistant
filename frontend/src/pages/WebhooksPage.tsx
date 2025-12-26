import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Plus, Trash2, Activity, CheckCircle2, XCircle, Send, Power, PowerOff } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  last_status_code?: number;
  total_triggers: number;
  failed_triggers: number;
  created_at: string;
}

interface WebhookDelivery {
  id: number;
  event_type: string;
  status_code?: number;
  is_success: boolean;
  created_at: string;
  delivered_at?: string;
  error_message?: string;
  duration_ms?: number;
}

const EVENT_OPTIONS = [
  { value: 'code.created', label: 'Code Created' },
  { value: 'code.updated', label: 'Code Updated' },
  { value: 'code.deleted', label: 'Code Deleted' },
  { value: 'code.restored', label: 'Code Restored' },
  { value: 'comment.created', label: 'Comment Created' },
  { value: 'audit.logged', label: 'Audit Logged' },
];

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    retry_count: 3,
    timeout_seconds: 30,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/webhooks');
      setWebhooks(Array.isArray(response.data) ? response.data : response.data.webhooks || []);
    } catch (error: any) {
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId: number) => {
    try {
      const response = await api.get(`/webhooks/${webhookId}/deliveries`);
      setDeliveries(Array.isArray(response.data) ? response.data : response.data.deliveries || []);
    } catch (error: any) {
      toast.error('Failed to load delivery history');
    }
  };

  const handleCreateWebhook = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error('Name, URL, and at least one event are required');
      return;
    }

    try {
      await api.post('/webhooks', formData);
      toast.success('Webhook created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchWebhooks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (id: number, name: string) => {
    if (!confirm(`Delete webhook "${name}"?`)) return;

    try {
      await api.delete(`/webhooks/${id}`);
      toast.success('Webhook deleted');
      fetchWebhooks();
      if (selectedWebhook?.id === id) {
        setSelectedWebhook(null);
        setDeliveries([]);
      }
    } catch (error: any) {
      toast.error('Failed to delete webhook');
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      await api.put(`/webhooks/${webhook.id}`, { is_active: !webhook.is_active });
      toast.success(`Webhook ${!webhook.is_active ? 'activated' : 'deactivated'}`);
      fetchWebhooks();
    } catch (error: any) {
      toast.error('Failed to update webhook');
    }
  };

  const handleTestWebhook = async (webhookId: number) => {
    try {
      await api.post(`/webhooks/${webhookId}/test`, {
        event_type: 'test.ping',
      });
      toast.success('Test webhook sent! Check delivery history.');
      setIsTestModalOpen(false);
      if (selectedWebhook?.id === webhookId) {
        setTimeout(() => fetchDeliveries(webhookId), 1000);
      }
    } catch (error: any) {
      toast.error('Failed to send test webhook');
    }
  };

  const handleSelectWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    fetchDeliveries(webhook.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: [],
      retry_count: 3,
      timeout_seconds: 30,
    });
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Configure real-time event notifications</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Webhooks</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : !webhooks || webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No webhooks configured</p>
                <p className="text-sm text-gray-400 mt-1">Create one to get started</p>
              </CardContent>
            </Card>
          ) : (
            webhooks.map((webhook) => (
              <Card
                key={webhook.id}
                className={`cursor-pointer transition-all ${
                  selectedWebhook?.id === webhook.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelectWebhook(webhook)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Triggers: {webhook.total_triggers}</span>
                        <span>Failed: {webhook.failed_triggers}</span>
                        {webhook.last_status_code && (
                          <span>Last: {webhook.last_status_code}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(webhook);
                        }}
                        className="h-7 px-2"
                      >
                        {webhook.is_active ? (
                          <PowerOff className="h-3 w-3" />
                        ) : (
                          <Power className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestWebhook(webhook.id);
                        }}
                        className="h-7 px-2"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWebhook(webhook.id, webhook.name);
                        }}
                        className="h-7 px-2 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delivery History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {selectedWebhook ? `Deliveries: ${selectedWebhook.name}` : 'Delivery History'}
          </h2>
          {!selectedWebhook ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">Select a webhook to view delivery history</p>
              </CardContent>
            </Card>
          ) : deliveries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No deliveries yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {deliveries.map((delivery) => (
                <Card key={delivery.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {delivery.is_success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-semibold text-sm">{delivery.event_type}</span>
                          {delivery.status_code && (
                            <Badge variant={delivery.is_success ? 'default' : 'destructive'}>
                              {delivery.status_code}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>{new Date(delivery.created_at).toLocaleString()}</div>
                          {delivery.duration_ms && <div>Duration: {delivery.duration_ms}ms</div>}
                          {delivery.error_message && (
                            <div className="text-red-600">Error: {delivery.error_message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Webhook Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook to receive real-time notifications when events occur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production Webhook"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secret">Secret (Optional)</Label>
              <Input
                id="secret"
                type="password"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                placeholder="For HMAC signature verification"
              />
            </div>
            <div className="grid gap-2">
              <Label>Events to Listen</Label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_OPTIONS.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="rounded"
                    />
                    <label htmlFor={event.value} className="text-sm cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="retry">Retry Count</Label>
                <Input
                  id="retry"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.retry_count}
                  onChange={(e) => setFormData({ ...formData, retry_count: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="300"
                  value={formData.timeout_seconds}
                  onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
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
            <Button onClick={handleCreateWebhook}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
