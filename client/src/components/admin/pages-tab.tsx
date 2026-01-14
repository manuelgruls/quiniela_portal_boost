import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import type { Page } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '../../lib/queryClient';
import PageFormModal from './page-form-modal';
import { useToast } from '../../hooks/use-toast';

export default function PagesTab() {
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['/api/admin/pages'],
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return apiRequest('DELETE', `/api/admin/pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({
        title: "Página eliminada",
        description: "La página ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la página.",
      });
    },
  });

  const previewPageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return apiRequest('POST', '/api/powerbi/embed', { pageId });
    },
    onSuccess: (response, pageId) => {
      // Open preview in new tab or modal
      toast({
        title: "Vista previa",
        description: "Generando vista previa del dashboard...",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar la vista previa.",
      });
    },
  });

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowPageModal(true);
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setShowPageModal(true);
  };

  const handleDeletePage = (page: any) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la página "${page.title}"?`)) {
      deletePageMutation.mutate(page.id);
    }
  };

  const handlePreviewPage = (page: any) => {
    previewPageMutation.mutate(page.id);
  };

  const handleCloseModal = () => {
    setShowPageModal(false);
    setEditingPage(null);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Gestión de Páginas</h2>
        <Button
          onClick={handleCreatePage}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-create-page"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Página</span>
        </Button>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card rounded-2xl border border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card className="bg-card rounded-2xl border border-dashed border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay páginas configuradas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera página para comenzar a gestionar dashboards.
            </p>
            <Button onClick={handleCreatePage} data-testid="button-create-first-page">
              Crear primera página
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="bg-card rounded-2xl border border-border" data-testid={`card-page-${page.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground" data-testid={`text-page-title-${page.id}`}>
                    {page.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewPage(page)}
                      disabled={previewPageMutation.isPending}
                      className="p-1 hover:bg-muted"
                      title="Vista previa"
                      data-testid={`button-preview-page-${page.id}`}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPage(page)}
                      className="p-1 hover:bg-muted"
                      title="Editar"
                      data-testid={`button-edit-page-${page.id}`}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page)}
                      disabled={deletePageMutation.isPending}
                      className="p-1 hover:bg-muted"
                      title="Eliminar"
                      data-testid={`button-delete-page-${page.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4" data-testid={`text-page-description-${page.id}`}>
                  {page.description}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="text-foreground font-mono" data-testid={`text-page-slug-${page.id}`}>
                      {page.slug}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workspace:</span>
                    <span className="text-foreground font-mono" data-testid={`text-page-workspace-${page.id}`}>
                      {page.workspaceId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filtros:</span>
                    <Badge
                      variant={page.showFilterPane ? 'default' : 'secondary'}
                      className="text-xs"
                      data-testid={`badge-page-filters-${page.id}`}
                    >
                      {page.showFilterPane ? 'Habilitados' : 'Deshabilitados'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PageFormModal
        isOpen={showPageModal}
        onClose={handleCloseModal}
        page={editingPage}
      />
    </>
  );
}
