import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import type { Page } from '@shared/schema';
import { Button } from '@/components/ui/button';
import ProtectedLayout from '../components/layout/protected-layout';
import PowerBIEmbed from '../components/powerbi/powerbi-embed';

export default function DashboardViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  const { data: dashboard, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages/slug', slug],
    enabled: !!slug,
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          </div>
          <div className="bg-card rounded-2xl border border-border h-[600px] animate-pulse"></div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard no encontrado</h1>
            <p className="text-muted-foreground mb-4">
              El dashboard que buscas no existe o no tienes permisos para acceder a él.
            </p>
            <Button onClick={() => setLocation('/dashboard')} data-testid="button-back-to-dashboards">
              Volver a tableros
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-6">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="p-2 hover:bg-muted"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
                {dashboard.title}
              </h1>
              {dashboard.description && (
                <p className="text-muted-foreground">{dashboard.description}</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Power BI Embed Container */}
        <div className="flex-1 w-full overflow-hidden bg-card rounded-2xl border border-border">
          <PowerBIEmbed pageId={dashboard.id} showFilterPane={dashboard.showFilterPane} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
