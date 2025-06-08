
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { 
  Settings, 
  Database, 
  TestTube, 
  Flag, 
  Zap,
  Info
} from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { seedTestData } from '@/utils/testDataSeeder';
import { storageAdapter } from '@/adapters';
import { LocalStorageAdapter } from '@/adapters/LocalStorageAdapter';
import { useAuth } from '@/contexts';

const DevTools = () => {
  const { flags, updateFlag, resetFlags } = useFeatureFlags();
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);

  const handleSeedTestData = async () => {
    if (!user) {
      toast.error('Please log in to seed test data');
      return;
    }

    setSeeding(true);
    try {
      await seedTestData(user.id);
    } catch (error) {
      // Error already handled in seedTestData
    } finally {
      setSeeding(false);
    }
  };

  const getAdapterName = () => {
    if (storageAdapter instanceof LocalStorageAdapter) {
      return 'LocalStorageAdapter';
    }
    return 'SupabaseAdapter';
  };

  const getAdapterColor = () => {
    return storageAdapter instanceof LocalStorageAdapter ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Adapter Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Adapter Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Currently using:</span>
            <Badge className={getAdapterColor()}>
              {getAdapterName()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {storageAdapter instanceof LocalStorageAdapter 
              ? 'Data is stored locally in your browser. Export/import features are available.'
              : 'Data is stored in Supabase. Some dev features may be limited.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Toggle experimental features and development modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(flags).map(([flagName, enabled]) => (
            <div key={flagName} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={flagName} className="text-sm font-medium">
                  {flagName}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {getFlagDescription(flagName)}
                </p>
              </div>
              <Switch
                id={flagName}
                checked={enabled}
                onCheckedChange={(value) => updateFlag(flagName as keyof typeof flags, value)}
              />
            </div>
          ))}
          
          <Separator />
          
          <Button 
            onClick={resetFlags} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            Reset All Flags
          </Button>
        </CardContent>
      </Card>

      {/* Test Data Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Data Tools
          </CardTitle>
          <CardDescription>
            Generate sample data for testing and development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-2">Seed Test Data</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Creates a new test group with sample users, expenses, and pot activities
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              <li>• 1 Test Group with you as admin</li>
              <li>• 3 Sample users (Alice, Bob, Charlie)</li>
              <li>• 5 Mixed expenses with different amounts</li>
              <li>• 3 Pot activities (contributions & payout)</li>
            </ul>
            <Button 
              onClick={handleSeedTestData}
              disabled={seeding || !user}
              className="w-full"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              {seeding ? 'Seeding...' : '🌱 Seed Test Data'}
            </Button>
            
            {!user && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <Info className="h-3 w-3" />
                Please log in to seed test data
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Development Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <Badge variant="outline">{process.env.NODE_ENV}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current User:</span>
              <span className="font-mono text-xs">{user?.id || 'Not logged in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Adapter:</span>
              <span className="font-mono text-xs">{getAdapterName()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getFlagDescription = (flagName: string): string => {
  const descriptions: Record<string, string> = {
    'use-local-storage': 'Force use of LocalStorage adapter instead of Supabase',
    'enable-new-roles': 'Enable experimental role-based permissions',
    'offline-mode': 'Enable offline functionality and sync',
    'debug-mode': 'Show additional debug information in console',
    'demo-data': 'Show demo data when real data is empty'
  };
  
  return descriptions[flagName] || 'Feature flag description';
};

export default DevTools;
