
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import SyncStatusIndicator from './SyncStatusIndicator';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import { ConflictData } from '@/adapters/sync/types';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SyncDashboardProps {
  groupId?: string;
}

const SyncDashboard = ({ groupId }: SyncDashboardProps) => {
  const { 
    syncState, 
    conflicts, 
    isInitialized, 
    startSync, 
    stopSync, 
    syncGroupData, 
    resolveConflict 
  } = useSyncEngine(groupId);

  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const handleConflictClick = (conflict: ConflictData) => {
    setSelectedConflict(conflict);
    setShowConflictDialog(true);
  };

  const handleResolveConflict = async (
    conflictId: string, 
    strategy: 'local' | 'remote' | 'merge'
  ) => {
    await resolveConflict(conflictId, strategy);
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Initializing sync engine...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Status
            </div>
            <SyncStatusIndicator 
              status={syncState.status}
              lastSync={syncState.lastSync}
              conflictCount={conflicts.length}
            />
          </CardTitle>
          <CardDescription>
            Real-time synchronization status and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {syncState.peers.length}
              </div>
              <div className="text-sm text-gray-600">Active Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {conflicts.length}
              </div>
              <div className="text-sm text-gray-600">Conflicts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {syncState.pendingOperations}
              </div>
              <div className="text-sm text-gray-600">Pending Ops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {syncState.lastSync ? new Date(syncState.lastSync).toLocaleTimeString() : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
          </div>

          <div className="flex gap-2">
            {syncState.status === 'offline' || syncState.status === 'error' ? (
              <Button onClick={startSync} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Sync
              </Button>
            ) : (
              <Button onClick={stopSync} variant="outline" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Stop Sync
              </Button>
            )}
            
            <Button 
              onClick={() => syncGroupData()} 
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Section */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Data Conflicts ({conflicts.length})
            </CardTitle>
            <CardDescription>
              Resolve conflicts between local and remote data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleConflictClick(conflict)}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">
                        {conflict.conflictType.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Conflict ID: {conflict.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    Needs Resolution
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Peers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Peers ({syncState.peers.length})
          </CardTitle>
          <CardDescription>
            Other devices and users currently syncing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncState.peers.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No peers connected
            </div>
          ) : (
            <div className="space-y-2">
              {syncState.peers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      peer.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">Peer {peer.id.slice(0, 8)}...</div>
                      <div className="text-sm text-gray-600">
                        Last seen: {new Date(peer.lastSeen).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={peer.status === 'online' ? 'default' : 'secondary'}>
                    {peer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution Dialog */}
      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflict={selectedConflict}
        onResolve={handleResolveConflict}
      />
    </div>
  );
};

export default SyncDashboard;
