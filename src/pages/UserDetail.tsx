import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditUserModal } from '@/components/EditUserModal';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

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

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      const data = await usersApi.getById(userId);
      setUser(data);
    } catch (error: any) {
      console.error('Error loading user:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load user details';
      toast.error(errorMessage);
      navigate('/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: { username: string; email: string; description: string; roles: string; password?: string }) => {
    if (!user) return;

    try {
      const updatedUser = await usersApi.update(user.id, data);
      setUser(updatedUser);
      toast.success('User updated successfully', {
        style: {
          background: '#22c55e',
          color: 'white',
          border: '1px solid #16a34a',
          fontSize: '14px',
          fontWeight: '500'
        },
        duration: 3000
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update user';
      toast.error(errorMessage, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
          fontSize: '14px',
          fontWeight: '500'
        },
        duration: 5000
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            {user.name || user.username}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user.description || 'User details and configuration'}
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{user.name || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-sm">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{user.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm">{user.description || 'No description available'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Roles</label>
              <div className="flex flex-wrap gap-1">
                {user.roles.split(',').map((role) => (
                  <Badge
                    key={role}
                    variant={role.includes('ADMIN') || role.includes('MANAGER') || role.includes('ROOT') ? 'default' : 'destructive'}
                  >
                    {role.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{new Date(user.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{new Date(user.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {user && (
        <EditUserModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}