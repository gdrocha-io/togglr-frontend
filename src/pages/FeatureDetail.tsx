import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Copy, Calendar, Clock, Database, Shield, Activity, Zap, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { EditFeatureModal } from '@/components/EditFeatureModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AuditHistory } from '@/components/AuditHistory';
import { featuresApi } from '@/lib/api';
import { toast } from 'sonner';

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

export default function FeatureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isRoot, isAdmin } = useAuth();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toggleMessage, setToggleMessage] = useState<string | null>(null);
  const [showTogglePopover, setShowTogglePopover] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => { } });
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadFeature(id);
    }
  }, [id]);

  const loadFeature = async (featureId: string) => {
    try {
      const [name, namespace, environment] = featureId.split('|');
      const data = await featuresApi.getByParams(name, namespace, environment);
      setFeature(data);
    } catch (error) {
      toast.error('Failed to load feature details');
      navigate('/features');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleClick = () => {
    setShowTogglePopover(true);
  };

  const handleToggleConfirm = async () => {
    if (!feature) return;

    setShowTogglePopover(false);
    try {
      const updatedFeature = await featuresApi.update(feature.id, {
        enabled: !feature.enabled,
        metadata: feature.metadata
      });
      setFeature(updatedFeature);
      setToggleMessage(`${!feature.enabled ? 'Enabled' : 'Disabled'} ✓`);
      setTimeout(() => setToggleMessage(null), 2000);
    } catch (error) {
      setToggleMessage('Error ✗');
      setTimeout(() => setToggleMessage(null), 2000);
    }
  };

  const handleEdit = (data: { enabled: boolean; metadata: any }) => {
    if (!feature) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Save Changes',
      description: 'Are you sure you want to save the changes to this feature?',
      onConfirm: async () => {
        try {
          const updatedFeature = await featuresApi.update(feature.id, data);
          setFeature(updatedFeature);
          toast.success('Feature updated successfully');
        } catch (error) {
          toast.error('Failed to update feature');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDelete = async () => {
    if (!feature) return;

    try {
      await featuresApi.delete(feature.id);
      toast.success('Feature deleted successfully');
      navigate('/features');
    } catch (error) {
      toast.error('Failed to delete feature');
    } finally {
      setDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!feature) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/features')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Features
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{feature.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={feature.enabled ? "default" : "secondary"} className="text-xs">
                    {feature.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{feature.namespace}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{feature.environment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Control Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle Control */}
                <div className="text-center p-6 border rounded-xl bg-gradient-to-br from-background to-muted/10">
                  <div className="mb-4">
                    {isRoot ? (
                      <Popover open={showTogglePopover} onOpenChange={setShowTogglePopover}>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer">
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={handleToggleClick}
                              className="data-[state=checked]:!bg-green-600 data-[state=unchecked]:!bg-red-600 scale-125"
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" side="bottom" align="center">
                          <div className="space-y-3">
                            <p className="text-sm text-center">
                              {feature.enabled ? 'Disable this feature?' : 'Enable this feature?'}
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleToggleConfirm} className="flex-1">
                                Yes
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowTogglePopover(false)} className="flex-1">
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
                        className="data-[state=checked]:!bg-green-600 data-[state=unchecked]:!bg-red-600 opacity-50 scale-125"
                      />
                    )}
                  </div>
                  <p className="font-medium mb-1">
                    {feature.enabled ? 'Feature is Active' : 'Feature is Inactive'}
                  </p>
                  {toggleMessage ? (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {toggleMessage}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isRoot ? `Click to ${feature.enabled ? 'disable' : 'enable'}` : 'Read only'}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {(isAdmin || user?.roles?.includes('ROOT')) && (
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="w-full justify-start gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit Feature
                    </Button>
                  )}
                  {isRoot && (
                    <Button variant="destructive" onClick={() => setDeleteDialog(true)} className="w-full justify-start gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Feature
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={feature.enabled ? "default" : "secondary"}>
                    {feature.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <Badge variant="outline">{feature.environment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Namespace</span>
                  <Badge variant="outline">{feature.namespace}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Feature Information */}
            <Card className={`border-0 shadow-lg bg-gradient-to-br from-card to-muted/20 border-l-4 ${feature.enabled ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Feature Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${feature.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">{feature.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">Namespace</label>
                    </div>
                    <span className="font-medium">{feature.namespace}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">Environment</label>
                    </div>
                    <span className="font-medium">{feature.environment}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                    </div>
                    <span className="font-medium">{new Date(feature.createdAt).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(feature.updatedAt).toLocaleString('en-US')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Metadata Configuration
                  </CardTitle>
                  {feature.metadata && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(feature.metadata, null, 2));
                        toast.success('Metadata copied to clipboard');
                      }}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {feature.metadata ? (
                  <div className="bg-secondary/80 rounded-xl border-2 border-primary/20 overflow-hidden">
                    <div className="bg-primary/10 px-4 py-2 border-b border-primary/20">
                      <span className="text-xs font-medium text-primary">JSON</span>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm overflow-auto max-h-80 text-foreground font-mono leading-relaxed">
                        {JSON.stringify(feature.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                      <Database className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-medium mb-2">No Metadata Available</h3>
                    <p className="text-sm">This feature doesn't have any metadata configuration</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit History */}
            <AuditHistory
              entityType="FEATURE"
              entityId={feature.id.toString()}
              entityName={feature.name}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {feature && (
        <EditFeatureModal
          feature={feature}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEdit}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the feature <strong>{feature?.name}</strong>?
              This action cannot be undone and the feature will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}