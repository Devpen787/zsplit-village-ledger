
import { useState, useEffect, useCallback } from 'react';
import { SyncEngineAdapter } from '@/adapters/sync';
import { storageAdapter } from '@/adapters';
import { useAuth } from '@/contexts';
import { SyncState, ConflictData } from '@/adapters/sync/types';

export const useSyncEngine = (groupId?: string) => {
  const { user } = useAuth();
  const [syncEngine] = useState(() => new SyncEngineAdapter(storageAdapter));
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'offline',
    lastSync: 0,
    conflicts: [],
    peers: [],
    pendingOperations: 0
  });
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sync engine
  useEffect(() => {
    if (user && !isInitialized) {
      syncEngine.initialize(user.id, groupId)
        .then(() => {
          setIsInitialized(true);
          console.log('[USE SYNC] Sync engine initialized');
        })
        .catch(error => {
          console.error('[USE SYNC] Failed to initialize sync engine:', error);
        });
    }
  }, [user, groupId, syncEngine, isInitialized]);

  // Update sync state periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateState = async () => {
      try {
        const [state, conflictsData] = await Promise.all([
          syncEngine.getSyncState(),
          syncEngine.getConflicts()
        ]);
        
        setSyncState(state);
        setConflicts(conflictsData);
      } catch (error) {
        console.error('[USE SYNC] Failed to update sync state:', error);
      }
    };

    updateState();
    const interval = setInterval(updateState, 2000);
    
    return () => clearInterval(interval);
  }, [isInitialized, syncEngine]);

  const startSync = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await syncEngine.startSync();
      console.log('[USE SYNC] Sync started');
    } catch (error) {
      console.error('[USE SYNC] Failed to start sync:', error);
    }
  }, [isInitialized, syncEngine]);

  const stopSync = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await syncEngine.stopSync();
      console.log('[USE SYNC] Sync stopped');
    } catch (error) {
      console.error('[USE SYNC] Failed to stop sync:', error);
    }
  }, [isInitialized, syncEngine]);

  const syncGroupData = useCallback(async (targetGroupId?: string) => {
    if (!isInitialized) return;
    
    const targetId = targetGroupId || groupId;
    if (!targetId) {
      console.warn('[USE SYNC] No group ID provided for sync');
      return;
    }
    
    try {
      await syncEngine.syncGroupData(targetId);
      console.log(`[USE SYNC] Synced group data for ${targetId}`);
    } catch (error) {
      console.error('[USE SYNC] Failed to sync group data:', error);
    }
  }, [isInitialized, syncEngine, groupId]);

  const resolveConflict = useCallback(async (
    conflictId: string, 
    strategy: 'local' | 'remote' | 'merge' = 'merge'
  ) => {
    if (!isInitialized) return;
    
    try {
      await syncEngine.resolveConflict(conflictId, strategy);
      console.log(`[USE SYNC] Resolved conflict ${conflictId} with strategy ${strategy}`);
    } catch (error) {
      console.error('[USE SYNC] Failed to resolve conflict:', error);
    }
  }, [isInitialized, syncEngine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        syncEngine.destroy().catch(error => {
          console.error('[USE SYNC] Failed to destroy sync engine:', error);
        });
      }
    };
  }, [isInitialized, syncEngine]);

  return {
    syncState,
    conflicts,
    isInitialized,
    startSync,
    stopSync,
    syncGroupData,
    resolveConflict,
    syncEngine
  };
};
