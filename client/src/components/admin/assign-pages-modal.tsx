import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { Page, Profile, UserPageAccess } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

interface AssignPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
}

export default function AssignPagesModal({ isOpen, onClose, user }: AssignPagesModalProps) {
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all available pages
  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ['/api/admin/pages'],
    enabled: isOpen,
  });

  // Get user's current page access
  const { data: userPages = [] } = useQuery<UserPageAccess[]>({
    queryKey: ['/api/admin/users', user?.id, 'pages'],
    enabled: isOpen && !!user?.id,
  });

  // Update selected pages when user changes or data loads
  useEffect(() => {
    if (isOpen && userPages) {
      const assignedPageIds = userPages
        .filter(access => access.enabled)
        .map(access => access.pageId);
      setSelectedPageIds(assignedPageIds);
    }
  }, [userPages, isOpen]);

  // Clear selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPageIds([]);
    }
  }, [isOpen]);

  const assignPagesMutation = useMutation({
    mutationFn: async (pageIds: string[]) => {
      if (!user?.id) throw new Error('No user selected');
      return apiRequest('POST', `/api/admin/users/${user.id}/assign-pages`, { pageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', user?.id, 'pages'] });
      toast({
        title: "Páginas asignadas",
        description: `Se han asignado las páginas correctamente a ${user?.fullName}.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron asignar las páginas.",
      });
    },
  });

  const handlePageToggle = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPageIds(prev => [...prev, pageId]);
    } else {
      setSelectedPageIds(prev => prev.filter(id => id !== pageId));
    }
  };

  const handleSubmit = () => {
    assignPagesMutation.mutate(selectedPageIds);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} data-testid="dialog-assign-pages">
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Asignar páginas a {user.fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecciona las páginas que {user.fullName} podrá acceder en el sistema.
          </p>

          {pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay páginas disponibles para asignar.</p>
              <p className="text-xs mt-1">Crea páginas en la pestaña "Páginas" primero.</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3">
              {pages.map((page) => {
                const isSelected = selectedPageIds.includes(page.id);
                return (
                  <div key={page.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`page-${page.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handlePageToggle(page.id, !!checked)}
                      data-testid={`checkbox-page-${page.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`page-${page.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {page.title}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {page.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Slug: /{page.slug}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground" data-testid="text-selected-pages-count">
            {selectedPageIds.length} página{selectedPageIds.length !== 1 ? 's' : ''} seleccionada{selectedPageIds.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={assignPagesMutation.isPending}
              data-testid="button-assign-pages-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={assignPagesMutation.isPending}
              data-testid="button-assign-pages-submit"
            >
              {assignPagesMutation.isPending ? 'Asignando...' : 'Asignar páginas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}