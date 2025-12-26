import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { auditService, AuditLog } from '../services/audit';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Eye, RefreshCcw, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
      };

      const data = activeTab === 'my'
        ? await auditService.getMyAuditLogs(skip, limit, filters)
        : await auditService.getAuditLogs(skip, limit, filters);

      setLogs(data.items);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [skip, actionFilter, resourceFilter, activeTab]);

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatChanges = (changes: Record<string, any> | null) => {
    if (!changes) return null;
    
    return (
      <div className="text-sm mt-2 space-y-1">
        {changes.old && (
          <div>
            <span className="font-medium">Old:</span>{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">
              {JSON.stringify(changes.old, null, 2)}
            </code>
          </div>
        )}
        {changes.new && (
          <div>
            <span className="font-medium">New:</span>{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">
              {JSON.stringify(changes.new, null, 2)}
            </code>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button onClick={fetchLogs} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my' | 'all')}>
        <TabsList className="mb-4">
          <TabsTrigger value="my">My Activity</TabsTrigger>
          {user?.is_superuser && <TabsTrigger value="all">All Activity</TabsTrigger>}
        </TabsList>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All resources</SelectItem>
                <SelectItem value="diagnostic_code">Diagnostic Codes</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>

            {(actionFilter || resourceFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setActionFilter('');
                  setResourceFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{log.resource_type}</span>
                          {log.resource_id && (
                            <span className="text-sm text-gray-500">#{log.resource_id}</span>
                          )}
                        </div>
                        
                        {log.changes && formatChanges(log.changes)}
                        
                        <div className="mt-2 text-xs text-gray-500 space-x-4">
                          <span>
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                          {log.ip_address && (
                            <span>IP: {log.ip_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {logs.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} logs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSkip(skip + limit)}
                  disabled={skip + limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
