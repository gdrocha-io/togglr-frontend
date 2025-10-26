import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, User, Calendar, ChevronDown, ChevronRight, Filter, Clock, Shield, Plus, Edit, Trash2, Eye, Users, Settings, Sparkles, FileEdit, Activity, RotateCcw, ChevronUp } from 'lucide-react';
import { auditApi } from '@/lib/api';

interface AuditLog {
  id: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  oldValues?: string;
  newValues?: string;
  ipAddress: string;
  userType: string;
  dataSource: string;
  traceId: string;
  createdAt: string;
}

interface AuditHistoryProps {
  entityType: string;
  entityId: string;
  entityName: string;
}

export function AuditHistory({ entityType, entityId, entityName }: AuditHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [filters, setFilters] = useState({
    actions: [] as string[],
    userType: 'all',
    username: '',
    dataSource: 'all'
  });
  const [expandedValues, setExpandedValues] = useState<Set<string>>(new Set());


  useEffect(() => {
    if (hasLoaded) {
      const timeoutId = setTimeout(() => {
        const currentScrollY = window.scrollY;
        loadAuditLogs(0).then(() => {
          window.scrollTo(0, currentScrollY);
        });
      }, filters.username ? 500 : 0);

      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  const loadAuditLogs = async (page = 0) => {
    setIsLoading(true);
    setAccessDenied(false);
    try {
      const response = await auditApi.getByFeature(
        entityId,
        page,
        10,
        filters.actions.length > 0 ? filters.actions.join(',') : undefined,
        filters.userType !== 'all' ? filters.userType : undefined,
        filters.username.trim() || undefined,
        filters.dataSource !== 'all' ? filters.dataSource : undefined
      );
      setAuditLogs(Array.isArray(response?.content) ? response.content : []);
      setPagination({ page: response?.number || 0, totalPages: response?.totalPages || 0, totalElements: response?.totalElements || 0 });
      setHasLoaded(true);
    } catch (error: any) {
      console.error('Failed to load audit logs:', error);
      if (error.status === 403) {
        setAccessDenied(true);
      }
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  };



  const toggleAction = (action: string, event: React.MouseEvent) => {
    event.preventDefault();
    (event.target as HTMLElement).blur();
    setFilters(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    if (newExpanded && !hasLoaded) {
      loadAuditLogs();
    }
  };

  const getActionConfig = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return { color: 'bg-primary/10 text-primary border-primary/20', icon: <Sparkles className="h-2.5 w-2.5" /> };
      case 'UPDATE': return { color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', icon: <FileEdit className="h-2.5 w-2.5" /> };
      case 'DELETE': return { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <Trash2 className="h-2.5 w-2.5" /> };
      case 'ACCESS': return { color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: <Activity className="h-2.5 w-2.5" /> };
      default: return { color: 'bg-muted text-muted-foreground border-border', icon: <History className="h-2.5 w-2.5" /> };
    }
  };

  const getUserTypeConfig = (userType: string) => {
    return userType === 'USER'
      ? { color: 'bg-primary/10 text-primary border-primary/20', icon: <User className="h-2.5 w-2.5" /> }
      : { color: 'bg-secondary text-secondary-foreground border-secondary', icon: <Settings className="h-2.5 w-2.5" /> };
  };

  const getDataSourceConfig = (dataSource: string) => {
    return dataSource === 'CACHE'
      ? { color: 'text-muted-foreground', icon: <Activity className="h-2.5 w-2.5" /> }
      : { color: 'text-muted-foreground', icon: <Shield className="h-2.5 w-2.5" /> };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-semibold">Activity Timeline</span>
              <p className="text-sm text-muted-foreground font-normal">Track all changes and access</p>
            </div>
          </div>
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadAuditLogs(0)}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </CardTitle>
        <Button
          variant={isExpanded ? "secondary" : "outline"}
          size="sm"
          onClick={handleToggleExpand}
          className="flex items-center gap-2 w-fit"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {isExpanded ? 'Hide Timeline' : 'Show Timeline'}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Enhanced Filters */}
          <div className="mb-6 p-5 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Actions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CREATE', 'UPDATE', 'DELETE', 'ACCESS'].map((action) => {
                    const config = getActionConfig(action);
                    const isSelected = filters.actions.includes(action);
                    return (
                      <button
                        key={action}
                        onClick={(e) => toggleAction(action, e)}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected
                          ? config.color + ' shadow-sm'
                          : 'bg-background border-border hover:bg-muted/50'
                          }`}
                      >
                        <span className="mr-1">{config.icon}</span>
                        {action}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User Type</label>
                <Select value={filters.userType} onValueChange={(value) => setFilters(prev => ({ ...prev, userType: value }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                    <SelectItem value="CLIENT">API Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <Input
                  placeholder="Search by username..."
                  value={filters.username}
                  onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data Source</label>
                <Select value={filters.dataSource} onValueChange={(value) => setFilters(prev => ({ ...prev, dataSource: value }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="CACHE">Cached</SelectItem>
                    <SelectItem value="DATABASE">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="text-xs text-muted-foreground">
                Showing {auditLogs.length} of {pagination.totalElements} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAuditLogs(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="h-8 px-3"
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAuditLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Timeline Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/30 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : accessDenied ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-medium text-destructive mb-2">
                Access Denied
              </h3>
              <p className="text-sm text-muted-foreground">
                You don't have permission to view audit logs
              </p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <History className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-muted-foreground mb-2">
                {auditLogs.length === 0 ? 'No Activity Yet' : 'No Matching Activity'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {auditLogs.length === 0
                  ? 'Activity will appear here as changes are made'
                  : 'Try adjusting your filters to see more results'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {auditLogs.map((log, index) => {
                const actionConfig = getActionConfig(log.action);
                const userTypeConfig = getUserTypeConfig(log.userType);
                const dataSourceConfig = getDataSourceConfig(log.dataSource);

                return (
                  <div key={log.id} className="group relative">
                    <div className="flex gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-all">
                      {/* Avatar/Icon */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                        {actionConfig.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 px-2 py-0.5">
                            {actionConfig.icon} {log.action}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1 px-2 py-0.5">
                            {userTypeConfig.icon} {log.userType}
                          </Badge>
                          <div className="relative group/datasource">
                            <Badge variant="outline" className={`text-xs flex items-center gap-1 px-2 py-0.5 cursor-pointer ${dataSourceConfig.color}`}>
                              {dataSourceConfig.icon} {log.dataSource}
                            </Badge>
                            <div className={`absolute ${index < 2 ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover/datasource:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
                              {log.dataSource === 'CACHE' ? 'Value retrieved from cache' : 'Value retrieved from database'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{log.username}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground relative group/time">
                            <Clock className="h-3 w-3" />
                            <span className="cursor-pointer">
                              {formatTimeAgo(log.createdAt)}
                            </span>
                            <div className={`absolute ${index < 2 ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover/time:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
                              {new Date(log.createdAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        {log.traceId && (
                          <div className="mt-1 text-xs text-muted-foreground/60 font-mono">
                            {log.traceId}
                          </div>
                        )}

                        {/* Changes */}
                        {(log.oldValues || log.newValues) && (
                          <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                            <div className="space-y-1">
                              {log.oldValues && (
                                <div className="flex gap-2">
                                  <span className="text-destructive font-medium min-w-[40px]">Before:</span>
                                  <div className="flex-1">
                                    <code className="text-destructive bg-destructive/10 px-1.5 py-0.5 rounded break-all">
                                      {expandedValues.has(`${log.id}-old`) || log.oldValues.length <= 100
                                        ? log.oldValues
                                        : `${log.oldValues.substring(0, 100)}...`}
                                    </code>
                                    {log.oldValues.length > 100 && (
                                      <button
                                        onClick={() => {
                                          const key = `${log.id}-old`;
                                          setExpandedValues(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(key)) {
                                              newSet.delete(key);
                                            } else {
                                              newSet.add(key);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        {expandedValues.has(`${log.id}-old`) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              {log.newValues && (
                                <div className="flex gap-2">
                                  <span className="text-green-600 dark:text-green-400 font-medium min-w-[40px]">After:</span>
                                  <div className="flex-1">
                                    <code className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 px-1.5 py-0.5 rounded break-all">
                                      {expandedValues.has(`${log.id}-new`) || log.newValues.length <= 100
                                        ? log.newValues
                                        : `${log.newValues.substring(0, 100)}...`}
                                    </code>
                                    {log.newValues.length > 100 && (
                                      <button
                                        onClick={() => {
                                          const key = `${log.id}-new`;
                                          setExpandedValues(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(key)) {
                                              newSet.delete(key);
                                            } else {
                                              newSet.add(key);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        {expandedValues.has(`${log.id}-new`) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}