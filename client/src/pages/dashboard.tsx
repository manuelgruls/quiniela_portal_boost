import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart3 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLocation } from 'wouter';
import type { Page } from '@shared/schema';
import ProtectedLayout from '../components/layout/protected-layout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: userDashboards = [], isLoading } = useQuery<Page[]>({
    queryKey: ['/api/user/dashboards'],
  });

  const getIcon = (iconName: string | null) => {
    if (iconName && iconName in LucideIcons) {
      return (LucideIcons as any)[iconName];
    }
    return LucideIcons.BarChart3;
  };

  // Extract first name from full name
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido(a) {firstName} a Portal BOOST
          </h1>
          <p className="text-muted-foreground text-lg">Accede a tus dashboards y analiza los datos de tu organización</p>
        </div>

        {/* Dashboards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Tus tableros</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : userDashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDashboards.map((dashboard) => {
                const IconComponent = getIcon(dashboard.icon);
                return (
                  <Card
                    key={dashboard.id}
                    className="bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer group h-full"
                    onClick={() => setLocation(`/dashboard/${dashboard.slug}`)}
                    data-testid={`card-dashboard-${dashboard.slug}`}
                  >
                    <CardContent className="p-6 flex items-center justify-between h-full min-h-[160px]">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground text-3xl leading-none pt-1">
                          {dashboard.title}
                        </h3>
                      </div>
                      <ArrowRight className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <Card className="bg-card rounded-2xl border border-dashed border-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-dashboards">
                  No tienes tableros asignados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Contacta a tu administrador para obtener acceso a los dashboards.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
