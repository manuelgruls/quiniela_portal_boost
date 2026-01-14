import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, LogOut, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../../hooks/use-auth';

interface TopNavigationProps {
  onToggleSidebar?: () => void;
}

export default function TopNavigation({ onToggleSidebar }: TopNavigationProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('sistema');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'sistema';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeValue: string) => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');

    if (themeValue === 'sistema') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        html.classList.add('dark');
      } else {
        html.classList.add('light');
      }
    } else if (themeValue === 'oscuro') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'claro':
        return <Sun className="w-4 h-4" />;
      case 'oscuro':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted"
            data-testid="button-hamburger"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation('/dashboard')}
          >
            <img src="/logo.png" alt="Portal Boost" className="h-8" />
            <span className="font-semibold text-foreground text-lg">Portal BOOST</span>
          </div>
        </div>

        {/* Theme Selector and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-muted">
                {getThemeIcon(theme)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleThemeChange('claro')} data-testid="theme-claro">
                <Sun className="w-4 h-4 mr-2" />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('oscuro')} data-testid="theme-oscuro">
                <Moon className="w-4 h-4 mr-2" />
                Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('sistema')} data-testid="theme-sistema">
                <Monitor className="w-4 h-4 mr-2" />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-muted" data-testid="button-user-menu">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {user ? getUserInitials(user.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground hidden sm:block">{user?.email}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
