import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  description?: string;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; username: string; email: string; description: string; roles: string; password?: string }) => void;
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || '');
  const [description, setDescription] = useState(user.description || '');
  const [roles, setRoles] = useState(user.roles);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const data: any = {};
      
      if (name !== (user.name || '')) data.name = name;
      if (username !== user.username) data.username = username;
      if (email !== (user.email || '')) data.email = email;
      if (description !== (user.description || '')) data.description = description;
      if (roles !== user.roles) data.roles = roles;
      if (password.trim()) data.password = password;
      
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                type="email"
              />
            </div>
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter user description"
              rows={3}
            />
          </div>

          <div>
            <Label>Roles</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Comma-separated roles (e.g., USER,ADMIN,MANAGER)
            </p>
            <Input 
              value={roles} 
              onChange={(e) => setRoles(e.target.value)}
              placeholder="USER,ADMIN,MANAGER"
            />
          </div>

          <div>
            <Label>New Password</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Leave empty to keep current password
            </p>
            <Input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              type="password"
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