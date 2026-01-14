import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Page } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '../../hooks/use-auth';
import TopNavigation from './top-navigation';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAdmin } = useAuth();

  const { data: userDashboards = [] } = useQuery<Page[]>({
    queryKey: ['/api/user/dashboards'],
    enabled: !!user,
  });

  const navigateTo = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  const getIcon = (iconName: string | null) => {
    if (iconName && iconName in LucideIcons) {
      return (LucideIcons as any)[iconName];
    }
    return LucideIcons.BarChart3;
  };

  return (
    <>
      <TopNavigation onToggleSidebar={() => setOpen(true)} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo('/dashboard')}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <img src="/logo.png" alt="Portal Boost" className="h-8" />
                </div>
                <SheetTitle className="font-semibold text-foreground">Portal BOOST</SheetTitle>
              </div>
              {/* Duplicate Close Button Removed */}
            </div>
          </SheetHeader>

          <div className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Tableros
              </h3>

              {userDashboards.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No tienes tableros asignados
                </div>
              ) : (
                userDashboards.map((dashboard) => {
                  const IconComponent = getIcon(dashboard.icon);
                  return (
                    <Button
                      key={dashboard.id}
                      variant="ghost"
                      className="w-full justify-start space-x-3 p-3 h-auto hover:bg-muted"
                      onClick={() => navigateTo(`/dashboard/${dashboard.slug}`)}
                      data-testid={`button-dashboard-${dashboard.slug}`}
                    >
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{dashboard.title}</span>
                    </Button>
                  );
                })
              )}
            </div>

            {isAdmin && (
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Administraci&#243;n
                </h3>
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-3 p-3 h-auto hover:bg-muted"
                  onClick={() => navigateTo('/admin')}
                  data-testid="button-admin-panel"
                >
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Panel de Administraci&#243;n</span>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
