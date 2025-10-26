import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit, Trash2, Flag, Filter, SortAsc, Eye, Zap, Shield, Settings, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { featuresApi, environmentsApi, namespacesApi } from '@/lib/api';
import { toast } from 'sonner';
import FeatureCardSkeleton from '@/components/FeatureCardSkeleton';

interface Feature {
  id: number;
  name: string;
  namespace: string;
  environment: string;
  enabled: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function Features() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isRoot } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<Feature[]>([]);
  const [search, setSearch] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [enabledFilter, setEnabledFilter] = useState<string>('all');
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglePopover, setTogglePopover] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; feature: Feature | null }>({ open: false, feature: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    namespace: '',
    environment: '',
    enabled: true,
    metadata: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const namespace = searchParams.get('namespace');
    const environment = searchParams.get('environment');
    const enabled = searchParams.get('enabled');

    if (namespace) {
      setNamespaceFilter(namespace);
    }
    if (environment) {
      setEnvironmentFilter(environment);
    }
    if (enabled !== null) {
      setEnabledFilter(enabled);
    }
  }, [searchParams]);

  useEffect(() => {
    filterFeatures();
  }, [features, search, namespaceFilter, environmentFilter, enabledFilter, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      const [featuresData, namespacesData, environmentsData] = await Promise.all([
        featuresApi.getAll(),
        namespacesApi.getAll(),
        environmentsApi.getAll(),
      ]);
      setFeatures(featuresData);
      setNamespaces(namespacesData);
      setEnvironments(environmentsData);
    } catch (error) {
      toast.error('Failed to load features');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFeatures = () => {
    if (!features || features.length === 0) {
      setFilteredFeatures([]);
      return;
    }

    try {
      let filtered = [...features];

      if (search) {
        filtered = filtered.filter(
          (f) =>
            f.name?.toLowerCase().includes(search.toLowerCase()) ||
            f.metadata?.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (namespaceFilter !== 'all') {
        filtered = filtered.filter((f) => f.namespace === namespaceFilter);
      }

      if (environmentFilter !== 'all') {
        filtered = filtered.filter((f) => f.environment === environmentFilter);
      }

      if (enabledFilter !== 'all') {
        const isEnabled = enabledFilter === 'true';
        filtered = filtered.filter((f) => f.enabled === isEnabled);
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'namespace':
            aValue = a.namespace.toLowerCase();
            bValue = b.namespace.toLowerCase();
            break;
          case 'environment':
            aValue = a.environment.toLowerCase();
            bValue = b.environment.toLowerCase();
            break;
          case 'enabled':
            aValue = a.enabled ? 1 : 0;
            bValue = b.enabled ? 1 : 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredFeatures(filtered);
    } catch (error) {
      console.error('Error filtering features:', error);
      setFilteredFeatures([]);
    }
  };

  const handleToggleClick = (featureId: number) => {
    setTogglePopover(featureId);
  };

  const handleToggleConfirm = async (feature: Feature) => {
    setTogglePopover(null);
    try {
      const updatedFeature = await featuresApi.update(feature.id, {
        enabled: !feature.enabled,
        metadata: feature.metadata
      });
      setFeatures((prev) =>
        prev.map((f) => (f.id === feature.id ? { ...f, enabled: !feature.enabled } : f))
      );
      toast.success(`Feature ${!feature.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle feature');
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name.trim() || !newFeature.namespace.trim() || !newFeature.environment.trim()) {
      toast.error('Name, namespace and environment are required');
      return;
    }

    try {
      let parsedMetadata;
      if (newFeature.metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(newFeature.metadata.trim());
        } catch {
          parsedMetadata = newFeature.metadata.trim();
        }
      }

      const featureData = {
        name: newFeature.name.trim(),
        namespace: newFeature.namespace.trim(),
        environment: newFeature.environment.trim(),
        enabled: newFeature.enabled,
        metadata: parsedMetadata
      };

      const createdFeature = await featuresApi.create(featureData);
      setFeatures(prev => [...prev, createdFeature]);
      toast.success('Feature created successfully');
      setCreateDialog(false);
      setNewFeature({ name: '', namespace: '', environment: '', enabled: true, metadata: '' });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create feature';
      toast.error(errorMessage);
    }
  };

  const handleDeleteFeature = async () => {
    if (!deleteDialog.feature) return;

    try {
      await featuresApi.delete(deleteDialog.feature.id);
      setFeatures((prev) => prev.filter((f) => f.id !== deleteDialog.feature!.id));
      toast.success('Feature deleted successfully');
    } catch (error: any) {
      console.error('Error deleting feature:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete feature';
      toast.error(errorMessage);
    } finally {
      setDeleteDialog({ open: false, feature: null });
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? 'default' : 'secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Features</h1>
                <p className="text-muted-foreground">Manage and control your feature flags</p>
              </div>
            </div>
            {isRoot && (
              <Button onClick={() => setCreateDialog(true)} className="gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                New Feature
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-muted/20 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Namespaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns.id} value={ns.name}>
                      {ns.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Environments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  {environments.map((env) => (
                    <SelectItem key={env.id} value={env.name}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={enabledFilter} onValueChange={setEnabledFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="namespace-asc">Namespace A-Z</SelectItem>
                  <SelectItem value="namespace-desc">Namespace Z-A</SelectItem>
                  <SelectItem value="environment-asc">Environment A-Z</SelectItem>
                  <SelectItem value="environment-desc">Environment Z-A</SelectItem>
                  <SelectItem value="enabled-desc">Enabled First</SelectItem>
                  <SelectItem value="enabled-asc">Disabled First</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {filteredFeatures.length} of {features.length} features
              </span>
              {(search || namespaceFilter !== 'all' || environmentFilter !== 'all' || enabledFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setNamespaceFilter('all');
                    setEnvironmentFilter('all');
                    setEnabledFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Sorted by {sortBy === 'createdAt' ? 'date created' : sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <FeatureCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredFeatures.length === 0 && features.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                <Flag className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No features found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {search || namespaceFilter !== 'all' || environmentFilter !== 'all' || enabledFilter !== 'all'
                  ? 'No features match your current filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first feature toggle to control your application features.'}
              </p>
              {isRoot && !search && namespaceFilter === 'all' && environmentFilter === 'all' && enabledFilter === 'all' && (
                <Button onClick={() => setCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Feature
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feature) => (
              <Card
                key={feature.id}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-card to-muted/10 border-l-4 ${feature.enabled ? 'border-l-green-500' : 'border-l-red-500'}`}
                onClick={() => navigate(`/features/${feature.name}|${feature.namespace}|${feature.environment}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${feature.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feature.metadata?.description || 'No description available'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(feature.enabled)} className="text-xs">
                        {feature.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      {isRoot && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/features/${feature.name}|${feature.namespace}|${feature.environment}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({ open: true, feature });
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Namespace</span>
                        </div>
                        <span className="text-sm font-medium">{feature.namespace}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Settings className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Environment</span>
                        </div>
                        <span className="text-sm font-medium">{feature.environment}</span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Created {new Date(feature.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Toggle Control */}
                    <div className="flex items-center justify-between pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                      {isRoot ? (
                        <Popover open={togglePopover === feature.id} onOpenChange={(open) => !open && setTogglePopover(null)}>
                          <PopoverTrigger asChild>
                            <div className="cursor-pointer">
                              <Switch
                                checked={feature.enabled}
                                onCheckedChange={() => handleToggleClick(feature.id)}
                                className="data-[state=checked]:!bg-green-600 data-[state=unchecked]:!bg-red-600"
                              />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3" side="bottom" align="center">
                            <div className="space-y-3">
                              <p className="text-sm text-center">
                                {feature.enabled
                                  ? 'Disable this feature?'
                                  : 'Enable this feature?'
                                }
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleToggleConfirm(feature)}
                                  className="flex-1"
                                >
                                  Yes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setTogglePopover(null)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Switch
                          checked={feature.enabled}
                          disabled
                          className="data-[state=checked]:!bg-green-600 data-[state=unchecked]:!bg-red-600 opacity-50"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              New Feature
            </DialogTitle>
            <DialogDescription>
              Create a new feature toggle with metadata.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Feature name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enabled">Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    id="enabled"
                    checked={newFeature.enabled}
                    onCheckedChange={(checked) => setNewFeature(prev => ({ ...prev, enabled: checked }))}
                    className="data-[state=checked]:!bg-green-600 data-[state=unchecked]:!bg-red-600"
                  />
                  <span className="text-sm">
                    {newFeature.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace *</Label>
                <Select value={newFeature.namespace} onValueChange={(value) => setNewFeature(prev => ({ ...prev, namespace: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select namespace" />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns) => (
                      <SelectItem key={ns.id} value={ns.name}>
                        {ns.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment *</Label>
                <Select value={newFeature.environment} onValueChange={(value) => setNewFeature(prev => ({ ...prev, environment: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.name}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata</Label>
              <Textarea
                id="metadata"
                value={newFeature.metadata}
                onChange={(e) => setNewFeature(prev => ({ ...prev, metadata: e.target.value }))}
                placeholder='{"description": "Feature description", "tags": ["frontend", "backend"]}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                JSON object, string, number, boolean, or any valid format
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFeature}>
              Create Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, feature: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the feature <strong>{deleteDialog.feature?.name}</strong>?
              This action cannot be undone and the feature will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFeature} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}