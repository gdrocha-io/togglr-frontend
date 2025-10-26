import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Package, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { namespacesApi } from '@/lib/api';
import { toast } from 'sonner';

interface Namespace {
  id: string;
  name: string;
  createdAt: string;
  totalFeatures?: number;
  activeFeatures?: number;
  inactiveFeatures?: number;
}

export default function Namespaces() {
  const navigate = useNavigate();
  const { isRoot } = useAuth();
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [filteredNamespaces, setFilteredNamespaces] = useState<Namespace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState('');

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; namespace: Namespace | null }>({ open: false, namespace: null });

  useEffect(() => {
    loadNamespaces();
  }, []);

  useEffect(() => {
    const filtered = namespaces.filter(ns =>
      ns.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNamespaces(filtered);
  }, [namespaces, searchTerm]);

  const loadNamespaces = async () => {
    try {
      const data = await namespacesApi.getAll();
      setNamespaces(data);
    } catch (error) {
      toast.error('Failed to load namespaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) {
      toast.error('Namespace name is required');
      return;
    }

    try {
      const newNamespace = await namespacesApi.create({ 
        name: newNamespaceName.trim()
      });
      setNamespaces(prev => [...prev, newNamespace]);
      toast.success('Namespace created successfully');
      setCreateDialog(false);
      setNewNamespaceName('');
    } catch (error) {
      toast.error('Failed to create namespace');
    }
  };

  const handleDeleteNamespace = async () => {
    if (!deleteDialog.namespace) return;

    try {
      await namespacesApi.delete(deleteDialog.namespace.id);
      setNamespaces(prev => prev.filter(ns => ns.id !== deleteDialog.namespace!.id));
      toast.success('Namespace deleted successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete namespace';
      toast.error(errorMessage);
    } finally {
      setDeleteDialog({ open: false, namespace: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background via-muted/30 to-muted/50 border p-8">
        <div className="relative z-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Namespaces
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Organize your feature toggles by application or team namespaces
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary" className="text-sm">
                {namespaces.length} namespaces
              </Badge>
              <Badge variant="outline" className="text-sm">
                {namespaces.reduce((acc, ns) => acc + (ns.totalFeatures || 0), 0)} total features
              </Badge>
            </div>
            {isRoot && (
              <Button onClick={() => setCreateDialog(true)} className="shadow-lg mt-4">
                <Plus className="h-4 w-4 mr-2" />
                New Namespace
              </Button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
      </div>

      {/* Search and filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search namespaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Namespaces grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNamespaces.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No namespaces found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Start by creating your first namespace'}
            </p>
            {isRoot && !searchTerm && (
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Namespace
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNamespaces.map((ns) => {
            return (
              <Card 
                key={ns.id} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
                onClick={() => navigate(`/namespaces/${ns.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 border-purple-200 transition-transform group-hover:scale-110">
                      <Package className="h-6 w-6" />
                    </div>
                    {isRoot && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, namespace: ns });
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
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {ns.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium">{ns.activeFeatures || 0}</span>
                          <span className="text-muted-foreground">active</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">{ns.inactiveFeatures || 0}</span>
                          <span className="text-muted-foreground">inactive</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {ns.totalFeatures || 0} features
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(ns.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Plus className="h-5 w-5" />
              </div>
              New Namespace
            </DialogTitle>
            <DialogDescription>
              Create a new namespace to organize your feature flags by application or team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Namespace Name
              </Label>
              <Input
                id="name"
                value={newNamespaceName}
                onChange={(e) => setNewNamespaceName(e.target.value)}
                placeholder="e.g. ecommerce, auth, payments"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNamespace()}
                className="h-11"
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNamespace} className="min-w-[120px]">
              Create Namespace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, namespace: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the namespace <strong>{deleteDialog.namespace?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNamespace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}