import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Edit, Key, Shield, Search, Trash } from 'lucide-react';
import type { Profile } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { useAuth } from '../../hooks/use-auth';
import UserFormModal from './user-form-modal';
import AssignPagesModal from './assign-pages-modal';
import { useToast } from '../../hooks/use-toast';

export default function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAssignPagesModal, setShowAssignPagesModal] = useState(false);
  const [assigningUser, setAssigningUser] = useState<any>(null);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado correctamente" });
      setIsUserModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message
      });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario creado correctamente" });
      setIsUserModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al crear",
        description: error.message
      });
    }
  });

  const { data: usersData, isLoading } = useQuery<{ users: Profile[], total: number }>({
    queryKey: ['/api/admin/users'],
  });

  const users = usersData?.users || [];

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('POST', `/api/admin/users/${userId}/reset-password`);
    },
    onSuccess: () => {
      toast({
        title: "Contraseña restablecida",
        description: "Se ha enviado un email con las instrucciones para restablecer la contraseña.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo restablecer la contraseña.",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario.",
      });
    },
  });

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (date: string | Date | null) => {
    if (!date) return 'Nunca';

    const dateObj = new Date(date);

    // FIX: The server saves EST time as UTC. We must add 5 hours
    // to convert the stored "20:00 Z" back to the real "01:00 Z" (UTC).
    // This syncs the display with Mexico City/CST time correctly.
    dateObj.setTime(dateObj.getTime() + (5 * 60 * 60 * 1000));

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    // Handle small negative diffs (clock skew)
    if (diffMs < 0 && diffMs > -60000) return 'Hace un momento';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hace 1 día';
    return `Hace ${diffDays} días`;
  };

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSubmit = (data: any) => {
    if (selectedUser) {
      // Edit Mode
      updateUserMutation.mutate({ id: selectedUser.id, data });
    } else {
      // Create Mode
      createUserMutation.mutate(data);
    }
  };

  const handleAssignPages = (user: any) => {
    setAssigningUser(user);
    setShowAssignPagesModal(true);
  };

  const handleCloseAssignPages = () => {
    setShowAssignPagesModal(false);
    setAssigningUser(null);
  };

  const handleDeleteUser = (user: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      deleteUserMutation.mutate(user.id);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Gestión de Usuarios</h2>
        <Button
          onClick={handleCreateUser}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-create-user"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Usuario</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
            data-testid="input-search-users"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-input border-border" data-testid="select-role-filter">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow>
                <TableHead className="text-foreground">Usuario</TableHead>
                <TableHead className="text-foreground">Rol</TableHead>
                <TableHead className="text-foreground">Estado</TableHead>
                <TableHead className="text-foreground">Último acceso</TableHead>
                <TableHead className="text-center text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-32 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-muted rounded w-48 animate-pulse"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm || roleFilter !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-user-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary-foreground'}>
                            {getUserInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground" data-testid={`text-user-name-${user.id}`}>{user.fullName}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.id}`}>{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={user.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}
                        data-testid={`badge-user-role-${user.id}`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? 'default' : 'destructive'}
                        className={user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}
                        data-testid={`badge-user-status-${user.id}`}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm" data-testid={`text-user-last-access-${user.id}`}>
                      {formatTimeAgo(user.lastAccess)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-muted"
                          title="Editar"
                          data-testid={`button-edit-user-${user.id}`}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetPasswordMutation.mutate(user.id)}
                          disabled={resetPasswordMutation.isPending}
                          className="p-2 hover:bg-muted"
                          title="Resetear contraseña"
                          data-testid={`button-reset-password-${user.id}`}
                        >
                          <Key className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignPages(user)}
                          className="p-2 hover:bg-muted"
                          title="Asignar páginas"
                          data-testid={`button-assign-pages-${user.id}`}
                        >
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        {currentUser?.id !== user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deleteUserMutation.isPending}
                            className="p-2 hover:bg-muted"
                            title="Eliminar usuario"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSubmit={handleUserSubmit}
      />

      <AssignPagesModal
        isOpen={showAssignPagesModal}
        onClose={handleCloseAssignPages}
        user={assigningUser}
      />
    </>
  );
}
