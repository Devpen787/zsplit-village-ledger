
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import DataManagement from '@/components/tools/DataManagement';

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
            Advanced tools for data management and debugging.
          </p>
        </div>

        <DataManagement />
      </div>
    </AppLayout>
  );
};

export default Tools;
