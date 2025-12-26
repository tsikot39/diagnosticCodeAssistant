import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Save, Star, Trash2, Play, Plus } from 'lucide-react';
import { searchService, SavedSearch } from '../services/search';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SavedSearchesPanelProps {
  onApplySearch?: (search: SavedSearch) => void;
}

export function SavedSearchesPanel({ onApplySearch }: SavedSearchesPanelProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [newSearchQuery, setNewSearchQuery] = useState('');
  const [newSearchFilters, setNewSearchFilters] = useState<{
    category?: string;
    severity?: string;
    is_active?: boolean;
  }>({});
  const [setAsDefault, setSetAsDefault] = useState(false);

  const fetchSavedSearches = async () => {
    setLoading(true);
    try {
      const searches = await searchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error: any) {
      toast.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const handleCreateSearch = async () => {
    if (!newSearchName || !newSearchQuery) {
      toast.error('Name and query are required');
      return;
    }

    try {
      const newSearch = await searchService.createSavedSearch({
        name: newSearchName,
        query: newSearchQuery,
        filters: newSearchFilters,
        is_default: setAsDefault,
      });

      setSavedSearches([...savedSearches, newSearch]);
      toast.success(`Saved search "${newSearchName}" created`);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create saved search');
    }
  };

  const handleDeleteSearch = async (searchId: number, name: string) => {
    if (!confirm(`Delete saved search "${name}"?`)) return;

    try {
      await searchService.deleteSavedSearch(searchId);
      setSavedSearches(savedSearches.filter(s => s.id !== searchId));
      toast.success(`Deleted "${name}"`);
    } catch (error: any) {
      toast.error('Failed to delete saved search');
    }
  };

  const handleApplySearch = (search: SavedSearch) => {
    onApplySearch?.(search);
    toast.success(`Applied "${search.name}"`);
  };

  const resetForm = () => {
    setNewSearchName('');
    setNewSearchQuery('');
    setNewSearchFilters({});
    setSetAsDefault(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Saved Searches</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Save Current
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-sm text-gray-500">Loading...</div>
      ) : savedSearches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Save className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No saved searches yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Save Current" to create one</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{search.name}</h4>
                      {search.is_default && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      Query: "{search.query}"
                    </p>
                    {search.filters && Object.keys(search.filters).length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {search.filters.category && (
                          <Badge variant="secondary" className="text-xs">
                            {search.filters.category}
                          </Badge>
                        )}
                        {search.filters.severity && (
                          <Badge variant="secondary" className="text-xs">
                            {search.filters.severity}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplySearch(search)}
                      className="h-7 px-2"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearch(search.id, search.name)}
                      className="h-7 px-2 text-red-600 hover:text-red-700"
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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search Preset</DialogTitle>
            <DialogDescription>
              Create a reusable search configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Active Diabetes Codes"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="query">Search Query</Label>
              <Input
                id="query"
                placeholder="e.g., diabetes"
                value={newSearchQuery}
                onChange={(e) => setNewSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                value={newSearchFilters.category || ''}
                onValueChange={(val) =>
                  setNewSearchFilters({ ...newSearchFilters, category: val || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="ENDOCRINE">Endocrine</SelectItem>
                  <SelectItem value="CARDIOVASCULAR">Cardiovascular</SelectItem>
                  <SelectItem value="RESPIRATORY">Respiratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity (Optional)</Label>
              <Select
                value={newSearchFilters.severity || ''}
                onValueChange={(val) =>
                  setNewSearchFilters({ ...newSearchFilters, severity: val || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="default" className="text-sm font-normal">
                Set as default search
              </Label>
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
            <Button onClick={handleCreateSearch}>
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
