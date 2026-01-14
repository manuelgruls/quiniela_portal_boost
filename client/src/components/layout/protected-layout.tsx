import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import TopNavigation from './top-navigation';
import Sidebar from './sidebar';
import PasswordChangeModal from '../auth/password-change-modal';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedLayout({ children, requireAdmin = false }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
    if (!isLoading && user && requireAdmin && user.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar />
      <main className="transition-all duration-300">
        {children}
      </main>
      {user.mustChangePassword && <PasswordChangeModal />}
    </div>
  );
}
