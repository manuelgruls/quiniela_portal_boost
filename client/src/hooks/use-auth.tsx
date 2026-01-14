import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getCurrentUser, login, logout, changePassword, type AuthUser, type LoginCredentials, type ChangePasswordData } from '../lib/auth';
import { useToast } from './use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/user'], userData);
      if (userData.mustChangePassword) {
        // Handle forced password change
        return;
      }
      setLocation('/dashboard');
      toast({
        title: "Bienvenido",
        description: `Hola ${userData.fullName}, has iniciado sesión correctamente.`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      setLocation('/login');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
      });
    },
  });

  const contextValue = {
    user: user || null,
    isLoading,
    login: async (credentials: LoginCredentials): Promise<void> => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async (): Promise<void> => {
      await logoutMutation.mutateAsync();
    },
    changePassword: async (data: ChangePasswordData): Promise<void> => {
      await changePasswordMutation.mutateAsync(data);
    },
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
