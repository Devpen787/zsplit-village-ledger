
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import SyncStatusIndicator from './SyncStatusIndicator';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import { SyncConflict } from '@/adapters/sync/types';

interface SyncDashboardProps {
  groupId?: string;
}

const SyncDashboard: React.FC<SyncDashboardProps> = ({ groupId }) => {
  const {
    isInitialized,
    syncState,
    startSync,
    stopSync,
    syncGroupData,
    resolveConflict
  } = useSyncEngine(groupId);

  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);

  const handleResolveConflict = async (conflictId: string, resolution: 'local' | 'remote') => {
    await resolveConflict(conflictId, resolution);
    setSelectedConflict(null);
  };

  const handleSimulateConflict = async () => {
    // This would be exposed through the sync engine for testing
    const mockConflict: SyncConflict = {
      id: `conflict-${Date.now()}`,
      type: 'expense',
      entityId: '22222222-2222-2222-2222-222222222221',
      localVersion: {
        title: 'Grocery Shopping at Migros',
        amount: 85.50,
        version: 2,
        last_modified: new Date().toISOString()
      },
      remoteVersion: {
        title: 'Grocery Shopping at Coop',
        amount: 82.75,
        version: 2,
        last_modified: new Date(Date.now() - 1000).toISOString()
      },
      conflictFields: ['title', 'amount'],
      timestamp: Date.now()
    };
    setSelectedConflict(mockConflict);
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm text-gray-500">Initializing sync engine...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const syncProgress = syncState?.pendingOperations 
    ? Math.max(0, (10 - syncState.pendingOperations) / 10 * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Sync Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Sync Status
              </CardTitle>
              <CardDescription>
                Real-time synchronization status and controls
              </CardDescription>
            </div>
            <SyncStatusIndicator
              status={syncState?.status || 'idle'}
              lastSync={syncState?.lastSync || undefined}
              conflictCount={syncState?.conflicts?.length || 0}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Progress */}
          {syncState?.status === 'syncing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing data...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
              {syncState.pendingOperations > 0 && (
                <p className="text-xs text-gray-500">
                  {syncState.pendingOperations} operations remaining
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {syncState?.status === 'syncing' ? (
              <Button onClick={stopSync} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Stop Sync
              </Button>
            ) : (
              <Button onClick={startSync} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Sync
              </Button>
            )}
            
            <Button 
              onClick={() => groupId ? syncGroupData(groupId) : syncGroupData()}
              variant="outline" 
              size="sm"
              disabled={syncState?.status === 'syncing'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Group Data
            </Button>

            <Button 
              onClick={handleSimulateConflict}
              variant="outline" 
              size="sm"
              className="ml-auto"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Conflict
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Peer Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Peers
          </CardTitle>
          <CardDescription>
            Other users currently syncing with this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncState?.peers && syncState.peers.length > 0 ? (
            <div className="space-y-3">
              {syncState.peers.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      peer.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">Peer {peer.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={peer.status === 'connected' ? 'default' : 'secondary'}>
                      {peer.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(peer.lastSeen).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No peers connected</p>
          )}
        </CardContent>
      </Card>

      {/* Conflicts */}
      {syncState?.conflicts && syncState.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Sync Conflicts
            </CardTitle>
            <CardDescription>
              Data conflicts that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncState.conflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {conflict.type} Conflict
                    </p>
                    <p className="text-xs text-gray-500">
                      Fields: {conflict.conflictFields.join(', ')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sync Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {syncState?.lastSync ? '✓' : '–'}
              </p>
              <p className="text-xs text-gray-500">Last Sync</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {syncState?.peers?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Connected Peers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {syncState?.conflicts?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Conflicts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {syncState?.pendingOperations || 0}
              </p>
              <p className="text-xs text-gray-500">Pending Ops</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolution Dialog */}
      <ConflictResolutionDialog
        conflict={selectedConflict}
        onResolve={handleResolveConflict}
        onClose={() => setSelectedConflict(null)}
      />
    </div>
  );
};

export default SyncDashboard;
