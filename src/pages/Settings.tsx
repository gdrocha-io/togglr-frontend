import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { usersApi } from '@/lib/api';
import { Palette, Key } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await usersApi.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
      throw new Error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Togglr looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="togglr-light">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-300"></div>
                      Togglr Light
                    </div>
                  </SelectItem>
                  <SelectItem value="togglr-dark">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-400"></div>
                      Togglr Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-600"></div>
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="cozy">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-400 border-2 border-orange-300"></div>
                      Cozy
                    </div>
                  </SelectItem>
                  <SelectItem value="forest">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-green-400"></div>
                      Forest
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-base">Password</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Change your account password
                </p>
                <Button onClick={() => setShowPasswordModal(true)} variant="outline">
                  Change Password
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-base">Account Information</Label>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Name:</strong> {user?.name || 'Not provided'}</p>
                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.roles}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure your API connection settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Configure this in your .env file using VITE_API_URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Information about Togglr
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
              <p>
                <strong>Description:</strong> Feature toggle management system
              </p>
              <p className="text-muted-foreground">
                Togglr helps you manage feature flags across different environments
                and namespaces with ease.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}
