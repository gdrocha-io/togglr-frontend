import { Moon, Sun, LogOut, User, Palette, ToggleLeft, Trees, CloudMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <SidebarTrigger />

        <div className="flex-1" />

        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-10 h-10 p-0 border-0 bg-transparent hover:bg-accent">
            <div className="flex items-center justify-center w-full">
              {theme === 'togglr-light' && <ToggleLeft className="h-4 w-4" />}
              {theme === 'togglr-dark' && <ToggleLeft className="h-4 w-4" />}
              {theme === 'dark' && <Moon className="h-4 w-4" />}
              {theme === 'forest' && <Trees className="h-4 w-4" />}
              {theme === 'cozy' && <Palette className="h-4 w-4" />}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="togglr-light">
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4" />
                Togglr Light
              </div>
            </SelectItem>
            <SelectItem value="togglr-dark">
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4" />
                Togglr Dark
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </div>
            </SelectItem>
            <SelectItem value="forest">
              <div className="flex items-center gap-2">
                <Trees className="h-4 w-4" />
                Forest
              </div>
            </SelectItem>
            <SelectItem value="cozy">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cozy
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
