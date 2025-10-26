import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, BarChart3, Activity, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { namespacesApi } from '@/lib/api';
import { toast } from 'sonner';
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
import { useAuth } from '@/contexts/AuthContext';

interface Namespace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  totalFeatures?: number;
  activeFeatures?: number;
  inactiveFeatures?: number;
}

interface NamespaceStats {
  total: number;
  enabled: number;
  disabled: number;
}

export default function NamespaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRoot } = useAuth();
  const [namespace, setNamespace] = useState<Namespace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NamespaceStats>({ total: 0, enabled: 0, disabled: 0 });
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadNamespace(id);
    }
  }, [id]);

  const loadNamespace = async (nsId: string) => {
    try {
      const nsData = await namespacesApi.getById(nsId);
      
      setNamespace(nsData);
      
      setStats({
        total: nsData.totalFeatures || 0,
        enabled: nsData.activeFeatures || 0,
        disabled: nsData.inactiveFeatures || 0
      });
    } catch (error) {
      toast.error('Failed to load namespace details');
      navigate('/namespaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFeatures = () => {
    navigate(`/features?namespace=${namespace?.name}`);
  };

  const handleDeleteNamespace = async () => {
    if (!namespace) return;

    try {
      await namespacesApi.delete(namespace.id);
      toast.success('Namespace deleted successfully');
      navigate('/namespaces');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete namespace';
      toast.error(errorMessage);
    } finally {
      setDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        <div className="rounded-xl border p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-muted rounded-2xl animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-64 animate-pulse" />
              <div className="flex gap-4">
                <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                <div className="h-6 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!namespace) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/namespaces')} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Namespaces
      </Button>

      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background via-muted/30 to-muted/50 border p-8">
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <Package className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {namespace.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    Namespace overview and feature management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  <Activity className="h-3 w-3 mr-1" />
                  {stats.total} features
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {new Date(namespace.createdAt).toLocaleDateString('pt-BR')}
                </Badge>
              </div>
               <div className="pt-6">
                {isRoot && (
                  <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Namespace
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/features?namespace=${namespace.name}`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Features</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/features?namespace=${namespace.name}&enabled=true`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Features</p>
                <p className="text-3xl font-bold text-green-600">{stats.enabled}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {stats.total > 0 ? Math.round((stats.enabled / stats.total) * 100) : 0}% of total
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/features?namespace=${namespace.name}&enabled=false`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Features</p>
                <p className="text-3xl font-bold text-gray-600">{stats.disabled}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-500/10 text-gray-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                {stats.total > 0 ? Math.round((stats.disabled / stats.total) * 100) : 0}% of total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the namespace <strong>{namespace?.name}</strong>?
              This action cannot be undone and will affect all features in this namespace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNamespace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Namespace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}