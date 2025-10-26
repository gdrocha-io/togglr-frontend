import { useEffect } from 'react';
import { LayoutDashboard, ToggleLeft, Users, Settings, Database, Activity } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { APP_CONFIG } from '@/lib/config';

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, shortcut: 'D' },
    ]
  },
  {
    label: 'Management',
    items: [
      { title: 'Features', url: '/features', icon: ToggleLeft, shortcut: 'F' },
      { title: 'Environments', url: '/environments', icon: Database, shortcut: 'E' },
      { title: 'Namespaces', url: '/namespaces', icon: Activity, shortcut: 'N' },
    ]
  },
  {
    label: 'Administration',
    items: [
      { title: 'Users', url: '/users', icon: Users, rootOnly: true, shortcut: 'U' },
      { title: 'Settings', url: '/settings', icon: Settings, shortcut: 'S' },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isRoot } = useAuth();
  const navigate = useNavigate();

  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const allItems = menuGroups.flatMap(group => group.items);
      const visibleItems = allItems.filter(item => !item.rootOnly || isRoot);
      
      const item = visibleItems.find(item => item.shortcut.toLowerCase() === e.key.toLowerCase());
      if (item) {
        e.preventDefault();
        navigate(item.url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isRoot]);

  const renderMenuItem = (item: any) => {
    const menuButton = (
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'hover:bg-sidebar-accent/50 hover:translate-x-1'
            }`
          }
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{item.title}</span>
              <kbd className="text-xs bg-sidebar-accent/30 px-1.5 py-0.5 rounded">
                {item.shortcut}
              </kbd>
            </div>
          )}
        </NavLink>
      </SidebarMenuButton>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {menuButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              <span>{item.title}</span>
              <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {item.shortcut}
              </kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return menuButton;
  };

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200" 
            onClick={() => navigate(APP_CONFIG.defaultRoute)}
          >
            <ToggleLeft className="h-6 w-6 text-sidebar-primary" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground">Togglr</span>
            )}
          </div>
        </div>

        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(item => !item.rootOnly || isRoot);
          
          if (visibleItems.length === 0) return null;
          
          return (
            <SidebarGroup key={group.label}>
              {!isCollapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {renderMenuItem(item)}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
