import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface EditFeatureModalProps {
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { enabled: boolean; metadata: any }) => void;
}

export function EditFeatureModal({ feature, isOpen, onClose, onSave }: EditFeatureModalProps) {
  const [enabled, setEnabled] = useState(feature.enabled);
  const [metadataText, setMetadataText] = useState(
    JSON.stringify(feature.metadata || {}, null, 2)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEnabled(feature.enabled);
    setMetadataText(JSON.stringify(feature.metadata || {}, null, 2));
  }, [feature]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const trimmedText = metadataText.trim();
      const metadata = trimmedText === '' ? {} : JSON.parse(trimmedText);
      await onSave({ enabled, metadata });
      onClose();
    } catch (error) {
      toast.error('Invalid JSON in metadata. Please check the syntax.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Feature: {feature.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={feature.name} disabled />
            </div>
            <div>
              <Label>Namespace</Label>
              <Input value={feature.namespace} disabled />
            </div>
          </div>
          
          <div>
            <Label>Environment</Label>
            <Input value={feature.environment} disabled />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label>Feature Enabled</Label>
          </div>

          <div>
            <Label>Metadata</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Can be any data type: JSON object, string, number, boolean, array, etc.
            </p>
            <Textarea
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder='Examples: {"key": "value"}, "string", 123, true, [1,2,3]'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}