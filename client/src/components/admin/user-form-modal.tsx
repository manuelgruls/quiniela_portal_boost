import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useEffect } from 'react';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'user'], { required_error: 'Selecciona un rol' }),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSubmit?: (data: UserFormData) => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSubmit }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      fullName: user?.fullName || '',
      role: user?.role || 'user',
      isActive: user?.isActive !== undefined ? user.isActive : true,
    },
  });

  // Sync form with user prop
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      form.reset({
        fullName: '',
        email: '',
        role: 'user',
        isActive: true,
      });
    }
  }, [user, form]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const url = isEditing ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = isEditing ? 'PATCH' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: isEditing ? "Usuario actualizado" : "Usuario creado",
        description: isEditing
          ? "El usuario ha sido actualizado exitosamente."
          : "Se ha creado el usuario y enviado una invitación por email.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud.",
      });
    },
  });

  const handleSubmit = (data: UserFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario@empresa.com"
                      type="email"
                      className="bg-input border-border text-foreground"
                      disabled={isEditing}
                      data-testid="input-user-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Nombre completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      className="bg-input border-border text-foreground"
                      data-testid="input-user-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Rol
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border" data-testid="select-user-role">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-user-active"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-foreground">
                    Usuario activo
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createUserMutation.isPending}
                data-testid="button-save-user"
              >
                {createUserMutation.isPending
                  ? (isEditing ? 'Actualizando...' : 'Creando...')
                  : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-border text-muted-foreground hover:bg-muted"
                data-testid="button-cancel-user"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
