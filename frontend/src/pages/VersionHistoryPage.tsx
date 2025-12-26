import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  History,
  ArrowLeft,
  GitCompare,
  RotateCcw,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import versionService, { CodeVersion, CodeVersionCompare } from '../services/versions';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

export function VersionHistoryPage() {
  const { codeId } = useParams<{ codeId: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<[number?, number?]>([]);
  const [comparison, setComparison] = useState<CodeVersionCompare | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreVersionId, setRestoreVersionId] = useState<number | null>(null);
  const [restoreComment, setRestoreComment] = useState('');

  useEffect(() => {
    if (codeId) {
      fetchVersions();
    }
  }, [codeId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await versionService.getVersionHistory(Number(codeId));
      setVersions(data.versions);
      setTotal(data.total);
      setCurrentVersion(data.current_version);
    } catch (error: any) {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedVersions[0] && selectedVersions[1]) {
      try {
        const data = await versionService.compareVersions(
          Number(codeId),
          selectedVersions[0],
          selectedVersions[1]
        );
        setComparison(data);
      } catch (error: any) {
        toast.error('Failed to compare versions');
      }
    }
  };

  const handleRestoreClick = (versionId: number) => {
    setRestoreVersionId(versionId);
    setIsRestoreModalOpen(true);
  };

  const handleRestore = async () => {
    if (!restoreVersionId) return;

    try {
      await versionService.restoreVersion(
        Number(codeId),
        restoreVersionId,
        restoreComment || undefined
      );
      toast.success('Version restored successfully');
      setIsRestoreModalOpen(false);
      setRestoreComment('');
      fetchVersions();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to restore version');
    }
  };

  const toggleVersionSelection = (versionId: number) => {
    if (!selectedVersions[0]) {
      setSelectedVersions([versionId, undefined]);
    } else if (!selectedVersions[1] && selectedVersions[0] !== versionId) {
      setSelectedVersions([selectedVersions[0], versionId]);
    } else {
      setSelectedVersions([versionId, undefined]);
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'RESTORE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading version history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Version History</h1>
            <p className="text-muted-foreground">
              {total} version{total !== 1 ? 's' : ''} • Current: v{currentVersion}
            </p>
          </div>
        </div>
        {selectedVersions[0] && selectedVersions[1] && (
          <Button onClick={handleCompare} className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare Selected
          </Button>
        )}
      </div>

      {/* Version Timeline */}
      <div className="space-y-4">
        {versions.map((version, index) => {
          const isSelected =
            selectedVersions.includes(version.id);
          const isCurrent = index === 0;

          return (
            <Card
              key={version.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${isCurrent ? 'border-green-500 border-2' : ''}`}
              onClick={() => toggleVersionSelection(version.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        v{version.version_number}
                      </Badge>
                      <Badge className={getChangeTypeColor(version.change_type)}>
                        {version.change_type}
                      </Badge>
                      {isCurrent && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Code:</span> {version.code}
                      </div>
                      <div>
                        <span className="font-semibold">Category:</span>{' '}
                        {version.category || 'N/A'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Description:</span>{' '}
                        {version.description}
                      </div>
                      {version.change_summary && (
                        <div className="col-span-2">
                          <span className="font-semibold">Changes:</span>{' '}
                          {version.change_summary}
                        </div>
                      )}
                      {version.changed_fields && version.changed_fields.length > 0 && (
                        <div className="col-span-2">
                          <span className="font-semibold">Modified fields:</span>{' '}
                          {version.changed_fields.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        User #{version.created_by}
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreClick(version.id);
                      }}
                      className="ml-4"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {comparison && (
        <Dialog open={!!comparison} onOpenChange={() => setComparison(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Version Comparison</DialogTitle>
              <DialogDescription>
                Comparing v{comparison.version_from.version_number} with v
                {comparison.version_to.version_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {Object.keys(comparison.differences).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No differences found</p>
              ) : (
                Object.entries(comparison.differences).map(([field, { old: oldVal, new: newVal }]) => (
                  <div key={field} className="border rounded-lg p-3">
                    <h4 className="font-semibold capitalize mb-2">{field}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-xs text-red-700 font-semibold mb-1">Old Value</div>
                        <div className="text-sm">
                          {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-700 font-semibold mb-1">New Value</div>
                        <div className="text-sm">
                          {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComparison(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Restore Confirmation Modal */}
      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              This will create a new version with the data from the selected version.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restore-comment">Comment (Optional)</Label>
              <Textarea
                id="restore-comment"
                placeholder="Explain why you're restoring this version..."
                value={restoreComment}
                onChange={(e) => setRestoreComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
