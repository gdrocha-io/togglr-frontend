import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToggleLeft, Database, Activity, ArrowRight, Users, Settings, TrendingUp, Zap, Globe, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { metricsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface Stats {
  features: number;
  environments: number;
  namespaces: number;
  users: number;
  enabledFeatures: number;
  disabledFeatures: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    features: 0,
    environments: 0,
    namespaces: 0,
    users: 0,
    enabledFeatures: 0,
    disabledFeatures: 0,
  });
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const metrics = await metricsApi.getDashboard();
      setStats({
        features: metrics.totalFeatures || 0,
        environments: metrics.totalEnvironments || 0,
        namespaces: metrics.totalNamespaces || 0,
        users: metrics.totalUsers || 0,
        enabledFeatures: metrics.activeFeatures || 0,
        disabledFeatures: (metrics.totalFeatures || 0) - (metrics.activeFeatures || 0),
      });
      setApiStatus('online');
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
      setApiStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeGradient = () => {
    switch (theme) {
      case 'togglr-light':
      case 'togglr-dark':
        return 'from-indigo-600 to-indigo-700';
      case 'cozy':
        return 'from-orange-500 to-orange-600';
      case 'forest':
        return 'from-green-600 to-green-700';
      default:
        return 'from-primary to-primary/80';
    }
  };

  const statCards = [
    {
      title: 'Total Features',
      value: stats.features,
      icon: ToggleLeft,
      gradient: getThemeGradient(),
      path: '/features',
      description: 'Feature toggles'
    },
    {
      title: 'Active Features',
      value: stats.enabledFeatures,
      icon: Zap,
      gradient: 'from-green-500 to-green-600',
      path: '/features?enabled=true',
      description: 'Currently enabled'
    },
    {
      title: 'Environments',
      value: stats.environments,
      icon: Globe,
      gradient: 'from-blue-500 to-blue-600',
      path: '/environments',
      description: 'Deployment contexts'
    },
    {
      title: 'Namespaces',
      value: stats.namespaces,
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      path: '/namespaces',
      description: 'Logical groupings'
    },
  ];

  if (user?.role === 'ROOT') {
    statCards.push({
      title: 'Users',
      value: stats.users,
      icon: Users,
      gradient: 'from-pink-500 to-pink-600',
      path: '/users',
      description: 'System users'
    });
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente temático */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/20 p-8 border">
        <div className="absolute inset-0 bg-gradient-to-br opacity-10" style={{
          background: `linear-gradient(135deg, ${getThemeGradient().replace('from-', '').replace(' to-', ', ')})`,
        }} />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getThemeGradient()} text-white shadow-lg`}>
              <ToggleLeft className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user?.name ? (user.name.split(' ')[0] || user.name) : user?.username}!
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Manage your feature toggles with precision and control
              </p>
            </div>
          </div>

          {stats.features > 0 && (
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{stats.enabledFeatures} active features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{stats.disabledFeatures} inactive features</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{Math.round((stats.enabledFeatures / stats.features) * 100)}% activation rate</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards de estatísticas com design moderno */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
            onClick={() => navigate(stat.path)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-sm`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions e Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:shadow-md transition-all"
                onClick={() => navigate('/features')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getThemeGradient()} text-white`}>
                    <ToggleLeft className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Manage Features</p>
                    <p className="text-sm text-muted-foreground">Create and toggle feature flags</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>

              {user?.role === 'ROOT' && (
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 hover:shadow-md transition-all"
                  onClick={() => navigate('/users')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium">User Management</p>
                      <p className="text-sm text-muted-foreground">Control access and permissions</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              )}

              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:shadow-md transition-all"
                onClick={() => navigate('/settings')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-muted-foreground">Customize your experience</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">API Status</span>
                </div>
                <span className={`text-sm font-medium ${apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                  {apiStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Your Role</span>
                </div>
                <span className={`text-sm font-medium ${user?.roles?.includes('ROOT') || user?.roles?.includes('ADMIN') ? 'text-red-600' : 'text-blue-600'
                  }`}>
                  {user?.roles?.includes('ROOT') ? 'ROOT' : user?.roles?.includes('ADMIN') ? 'ADMIN' : 'USER'}
                </span>
              </div>

              {stats.features > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Activation Rate</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {Math.round((stats.enabledFeatures / stats.features) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}