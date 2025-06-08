
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from 'lucide-react';
import { storageAdapter } from '@/adapters';
import { LocalStorageAdapter } from '@/adapters/LocalStorageAdapter';
import { useAuth } from '@/contexts';
import ExportSection from './data-management/ExportSection';
import ImportSection from './data-management/ImportSection';
import CurrentUserCard from './data-management/CurrentUserCard';
import AdapterNotice from './data-management/AdapterNotice';

const DataManagement = () => {
  const { user } = useAuth();
  const isLocalStorageAdapter = storageAdapter instanceof LocalStorageAdapter;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and import group data for backup or migration purposes.
            {!isLocalStorageAdapter && (
              <span className="block mt-2 text-amber-600 font-medium">
                Note: This functionality is only available when using the LocalStorage adapter.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ExportSection isLocalStorageAdapter={isLocalStorageAdapter} />
          
          <div className="border-t pt-6">
            <ImportSection isLocalStorageAdapter={isLocalStorageAdapter} />
          </div>

          <AdapterNotice isLocalStorageAdapter={isLocalStorageAdapter} />
        </CardContent>
      </Card>

      {user && <CurrentUserCard user={user} />}
    </div>
  );
};

export default DataManagement;
