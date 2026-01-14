import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AzureSettings } from '@shared/schema';
import { Save, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

const azureSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID es requerido').regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Formato de UUID inválido'),
  clientId: z.string().min(1, 'Client ID es requerido').regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Formato de UUID inválido'),
  clientSecret: z.string().min(1, 'Client Secret es requerido'),
});

type AzureFormData = z.infer<typeof azureSchema>;

export default function AzureTab() {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: azureSettings, isLoading } = useQuery<AzureSettings>({
    queryKey: ['/api/admin/azure'],
  });

  const form = useForm<AzureFormData>({
    resolver: zodResolver(azureSchema),
    defaultValues: {
      tenantId: azureSettings?.tenantId || '',
      clientId: azureSettings?.clientId || '',
      clientSecret: '',
    },
  });

  // Update form when data loads
  useState(() => {
    if (azureSettings) {
      form.reset({
        tenantId: azureSettings.tenantId,
        clientId: azureSettings.clientId,
        clientSecret: '',
      });
    }
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: AzureFormData) => {
      return apiRequest('POST', '/api/admin/azure', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/azure'] });
      toast({
        title: "Configuración guardada",
        description: "La configuración de Azure ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/azure/test-connection');
    },
    onSuccess: () => {
      setConnectionStatus('success');
      toast({
        title: "Conexión exitosa",
        description: "La conexión con Azure AD y Power BI ha sido verificada.",
      });
    },
    onError: () => {
      setConnectionStatus('error');
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con Azure AD. Verifica las credenciales.",
      });
    },
  });

  const onSubmit = (data: AzureFormData) => {
    saveConfigMutation.mutate(data);
  };

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    testConnectionMutation.mutate();
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Probando...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20">Conexión exitosa</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Error de conexión</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">No probado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Configuración de Azure y Power BI</h2>
        <Button
          form="azure-form"
          type="submit"
          disabled={saveConfigMutation.isPending}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-save-azure-config"
        >
          <Save className="w-4 h-4" />
          <span>{saveConfigMutation.isPending ? 'Guardando...' : 'Guardar configuración'}</span>
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Credenciales de Azure AD</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form id="azure-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tenant ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="bg-input border-border text-foreground font-mono"
                        data-testid="input-tenant-id"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      ID del tenant de Azure AD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Client ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="bg-input border-border text-foreground font-mono"
                        data-testid="input-client-id"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      ID de la aplicación registrada en Azure AD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Client Secret</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={azureSettings ? "••••••••••••••••••••••••••••••••" : "Ingresa el client secret"}
                          type={showClientSecret ? "text" : "password"}
                          className="bg-input border-border text-foreground font-mono pr-10"
                          data-testid="input-client-secret"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowClientSecret(!showClientSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      El secreto se almacena cifrado con AES-256-GCM
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending || !azureSettings}
                className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-testid="button-test-connection"
              >
                <Zap className="w-4 h-4" />
                <span>{testConnectionMutation.isPending ? 'Probando...' : 'Probar conexión'}</span>
              </Button>
              
              {getConnectionStatusBadge()}
            </div>
            
            {azureSettings && (
              <div className="text-xs text-muted-foreground">
                Última actualización: {new Date(azureSettings.updatedAt).toLocaleString('es-MX')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Power BI Settings (Read-only) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Configuración de Power BI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Authority URL</label>
              <Input
                value="https://login.microsoftonline.com"
                className="bg-input border-border text-foreground font-mono"
                readOnly
                data-testid="input-authority-url"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Resource URL</label>
              <Input
                value="https://analysis.windows.net/powerbi/api"
                className="bg-input border-border text-foreground font-mono"
                readOnly
                data-testid="input-resource-url"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">API Base URL</label>
              <Input
                value="https://api.powerbi.com/v1.0/myorg"
                className="bg-input border-border text-foreground font-mono"
                readOnly
                data-testid="input-api-base-url"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
