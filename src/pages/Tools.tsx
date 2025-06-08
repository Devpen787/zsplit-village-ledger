
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import DataManagement from '@/components/tools/DataManagement';
import DevTools from '@/components/tools/DevTools';

const Tools = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground mt-2">
            Advanced tools for data management, development, and debugging.
          </p>
        </div>

        <Tabs defaultValue="dev-tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dev-tools">Dev Tools</TabsTrigger>
            <TabsTrigger value="data-management">Data Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dev-tools">
            <DevTools />
          </TabsContent>
          
          <TabsContent value="data-management">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Tools;
