
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

// Import existing components
import DataManagement from '@/components/tools/DataManagement';
import DevTools from '@/components/tools/DevTools';

// Import new sync components
import SyncDashboard from '@/components/sync/SyncDashboard';
import GuestUserManager from '@/components/tools/GuestUserManager';

const Tools: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dev-tools');

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Developer Tools</h1>
            <p className="text-gray-600 mt-1">
              Advanced tools for data management, development, debugging, and synchronization.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dev-tools">Dev Tools</TabsTrigger>
            <TabsTrigger value="data-management">Data Management</TabsTrigger>
            <TabsTrigger value="sync-engine">Sync Engine</TabsTrigger>
            <TabsTrigger value="guest-users">Guest Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dev-tools">
            <DevTools />
          </TabsContent>

          <TabsContent value="data-management">
            <DataManagement />
          </TabsContent>

          <TabsContent value="sync-engine">
            <SyncDashboard />
          </TabsContent>

          <TabsContent value="guest-users">
            <GuestUserManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Tools;
