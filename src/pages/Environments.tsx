import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Globe, Server, Zap, Eye, Calendar, MoreVertical, Laptop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAuth } from '@/contexts/AuthContext';
import { environmentsApi, featuresApi } from '@/lib/api';
import { toast } from 'sonner';

interface Environment {
  id: string;
  name: string;
  createdAt: string;
  totalFeatures: number;
  activeFeatures: number;
  inactiveFeatures: number;
}

interface EnvironmentStats {
  [key: string]: {
    total: number;
    enabled: number;
  };
}

const getEnvironmentIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('prd') || lowerName.includes('prod') || lowerName.includes('production') || lowerName.includes('live')) return Globe;
  if (lowerName.includes('local') || lowerName.includes('localhost')) return Laptop;
  if (lowerName.includes('dev') || lowerName.includes('develop') || lowerName.includes('development')) return Zap;
  if (lowerName.includes('test') || lowerName.includes('qa')) return Eye;
  return Server;
};

const getEnvironmentColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('prd') || lowerName.includes('prod') || lowerName.includes('production') || lowerName.includes('live')) return 'bg-red-500/10 text-red-600 border-red-200';
  if (lowerName.includes('local') || lowerName.includes('localhost')) return 'bg-green-500/10 text-green-600 border-green-200';
  if (lowerName.includes('dev') || lowerName.includes('develop') || lowerName.includes('development')) return 'bg-blue-500/10 text-blue-600 border-blue-200';
  if (lowerName.includes('test') || lowerName.includes('qa')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
  if (lowerName.includes('stag') || lowerName.includes('hml') || lowerName.includes('homolog') || lowerName.includes('homologation')) return 'bg-purple-500/10 text-purple-600 border-purple-200';
  return 'bg-gray-500/10 text-gray-600 border-gray-200';
};

export default function Environments() {
  const navigate = useNavigate();
  const { isRoot } = useAuth();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [filteredEnvironments, setFilteredEnvironments] = useState<Environment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; environment: Environment | null }>({ open: false, environment: null });
  const [stats, setStats] = useState<EnvironmentStats>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    const filtered = environments.filter(env =>
      env.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEnvironments(filtered);
  }, [environments, searchTerm]);

  const loadEnvironments = async () => {
    try {
      const envData = await environmentsApi.getAll();
      
      setEnvironments(envData);
      
      // Use stats from environments API response
      const envStats: EnvironmentStats = {};
      envData.forEach(env => {
        envStats[env.name] = {
          total: env.totalFeatures || 0,
          enabled: env.activeFeatures || 0
        };
      });
      setStats(envStats);
    } catch (error) {
      toast.error('Failed to load environments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) {
      toast.error('Environment name is required');
      return;
    }

    try {
      const newEnv = await environmentsApi.create({ name: newEnvName.trim() });
      setEnvironments(prev => [...prev, newEnv]);
      toast.success('Environment created successfully');
      setCreateDialog(false);
      setNewEnvName('');
    } catch (error) {
      toast.error('Failed to create environment');
    }
  };

  const handleDeleteEnvironment = async () => {
    if (!deleteDialog.environment) return;

    try {
      await environmentsApi.delete(deleteDialog.environment.id);
      setEnvironments(prev => prev.filter(env => env.id !== deleteDialog.environment!.id));
      toast.success('Environment deleted successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete environment';
      toast.error(errorMessage);
    } finally {
      setDeleteDialog({ open: false, environment: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background via-muted/30 to-muted/50 border p-8">
        <div className="relative z-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Environments
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage deployment environments for your feature flags
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary" className="text-sm">
                {environments.length} environments
              </Badge>
              <Badge variant="outline" className="text-sm">
                {environments.reduce((acc, env) => acc + (env.totalFeatures || 0), 0)} total features
              </Badge>
            </div>
            {isRoot && (
              <Button onClick={() => setCreateDialog(true)} className="shadow-lg mt-4">
                <Plus className="h-4 w-4 mr-2" />
                New Environment
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
            placeholder="Search environments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Environments grid */}
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
      ) : filteredEnvironments.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No environments found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Start by creating your first environment'}
            </p>
            {isRoot && !searchTerm && (
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Environment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnvironments.map((env) => {
            const IconComponent = getEnvironmentIcon(env.name);
            const colorClass = getEnvironmentColor(env.name);
            const envStats = { total: env.totalFeatures || 0, enabled: env.activeFeatures || 0 };
            
            return (
              <Card 
                key={env.id} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md data-[state=open]:shadow-xl data-[state=open]:-translate-y-1"
                onClick={() => navigate(`/environments/${env.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClass} transition-transform group-hover:scale-110`}>
                      <IconComponent className="h-6 w-6" />
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
                              setDeleteDialog({ open: true, environment: env });
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
                        {env.name}
                      </h3>

                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium">{envStats.enabled}</span>
                          <span className="text-muted-foreground">active</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">{env.inactiveFeatures || 0}</span>
                          <span className="text-muted-foreground">inactive</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {envStats.total} features
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(env.createdAt).toLocaleDateString('pt-BR')}
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
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Plus className="h-5 w-5" />
              </div>
              New Environment
            </DialogTitle>
            <DialogDescription>
              Create a new environment to organize and manage your feature flags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Environment Name
              </Label>
              <Input
                id="name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                placeholder="e.g. production, staging, development"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateEnvironment()}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Use descriptive names like 'production', 'staging', 'development'
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEnvironment} className="min-w-[120px]">
              Create Environment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, environment: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the environment <strong>{deleteDialog.environment?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEnvironment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}