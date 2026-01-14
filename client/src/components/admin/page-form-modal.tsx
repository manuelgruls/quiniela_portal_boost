import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

// Schema accepts nullish for optional text fields
const pageSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  icon: z.string().min(1, 'El icono es requerido'),
  workspaceId: z.string().min(1, 'El workspace ID es requerido'),
  reportId: z.string().min(1, 'El report ID es requerido'),
  datasetId: z.string().min(1, 'El dataset ID es requerido'),
  defaultPageName: z.string().nullish(),
  showFilterPane: z.boolean().default(false),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: any;
}

export default function PageFormModal({ isOpen, onClose, page }: PageFormModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!page;

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      icon: page?.icon || '',
      workspaceId: page?.workspaceId || '',
      reportId: page?.reportId || '',
      datasetId: page?.datasetId || '',
      defaultPageName: page?.defaultPageName || '',
      showFilterPane: page ? !!page.showFilterPane : false, // Initial safe cast
    },
  });

  // CRITICAL FIX: Convert DB types (int/null) to Form types (bool/string)
  useEffect(() => {
    if (page) {
      form.reset({
        ...page,
        icon: page.icon || "BarChart3",
        // Convert 1/0 to true/false
        showFilterPane: !!page.showFilterPane,
        // Convert null to "" for text inputs
        description: page.description || "",
        defaultPageName: page.defaultPageName || ""
      });
    } else {
      form.reset({
        title: '',
        slug: '',
        icon: 'BarChart3',
        workspaceId: '',
        reportId: '',
        datasetId: '',
        defaultPageName: '',
        description: '',
        showFilterPane: false
      });
    }
  }, [page, form]);

  const savePageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const url = isEditing ? `/api/admin/pages/${page.id}` : '/api/admin/pages';
      const method = isEditing ? 'PATCH' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({
        title: isEditing ? "Página actualizada" : "Página creada",
        description: "La operación se completó exitosamente.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la página.",
      });
    },
  });

  const onSubmit = (data: PageFormData) => {
    savePageMutation.mutate(data);
  };

  const onInvalid = (errors: any) => {
    // Optional: Show toast if needed, but logging is usually enough
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditing ? 'Editar Página' : 'Crear Nueva Página'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ventas Q1"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          if (!isEditing && !form.getValues('slug')) generateSlug();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción de la página..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="ventas-q1" className="font-mono" {...field} />
                    </FormControl>
                    <FormDescription>Solo letras, números y guiones.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un icono" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BarChart3">BarChart3 (Ventas)</SelectItem>
                      <SelectItem value="PieChart">PieChart (Marketing)</SelectItem>
                      <SelectItem value="TrendingUp">TrendingUp (Finanzas)</SelectItem>
                      <SelectItem value="Zap">Zap (General)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="workspaceId" render={({ field }) => (
                <FormItem><FormLabel>Workspace ID</FormLabel><FormControl><Input className="font-mono" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reportId" render={({ field }) => (
                <FormItem><FormLabel>Report ID</FormLabel><FormControl><Input className="font-mono" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="datasetId" render={({ field }) => (
                <FormItem><FormLabel>Dataset ID</FormLabel><FormControl><Input className="font-mono" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField
              control={form.control}
              name="defaultPageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Página por defecto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ReportSection..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showFilterPane"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mostrar panel de filtros</FormLabel>
                    <FormDescription>Permitir a usuarios usar filtros de PowerBI.</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" disabled={savePageMutation.isPending}>
                {savePageMutation.isPending ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
