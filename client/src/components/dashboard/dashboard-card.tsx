import { ArrowRight, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface DashboardCardProps {
  dashboard: {
    id: string;
    slug: string;
    title: string;
    description: string;
    updatedAt: string;
  };
}

export default function DashboardCard({ dashboard }: DashboardCardProps) {
  const [, setLocation] = useLocation();

  const getDashboardIcon = (title: string) => {
    if (title.toLowerCase().includes('ventas')) return BarChart3;
    if (title.toLowerCase().includes('marketing')) return PieChart;
    if (title.toLowerCase().includes('finanzas')) return TrendingUp;
    return BarChart3;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updatedAt = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  const IconComponent = getDashboardIcon(dashboard.title);

  return (
    <Card
      className="bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={() => setLocation(`/dashboard/${dashboard.slug}`)}
      data-testid={`card-dashboard-${dashboard.slug}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{dashboard.title}</h3>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{dashboard.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Actualizado: {formatTimeAgo(dashboard.updatedAt)}
          </span>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
}
