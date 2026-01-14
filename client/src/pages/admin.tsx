import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedLayout from '../components/layout/protected-layout';
import UsersTab from '../components/admin/users-tab';
import PagesTab from '../components/admin/pages-tab';
import AzureTab from '../components/admin/azure-tab';

export default function AdminPage() {
  return (
    <ProtectedLayout requireAdmin>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, páginas y configuración de Azure/Power BI</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg w-fit">
            <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:text-foreground" data-testid="tab-users">
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-background data-[state=active]:text-foreground" data-testid="tab-pages">
              Páginas
            </TabsTrigger>
            <TabsTrigger value="azure" className="data-[state=active]:bg-background data-[state=active]:text-foreground" data-testid="tab-azure">
              Azure y Power BI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UsersTab />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <PagesTab />
          </TabsContent>

          <TabsContent value="azure" className="space-y-6">
            <AzureTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
