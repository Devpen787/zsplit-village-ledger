
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts';
import { MockSyncEngine } from '@/adapters/sync/MockSyncEngine';
import { SyncState, ConflictData } from '@/adapters/sync/types';

export const useSyncEngine = (groupId?: string) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  
  const syncEngineRef = useRef<MockSyncEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize sync engine
  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
      return;
    }

    const initializeEngine = async () => {
      try {
        console.log('[USE SYNC] Initializing sync engine for user:', user.id);
        
        // Create new sync engine instance
        const engine = new MockSyncEngine();
        syncEngineRef.current = engine;
        
        // Set up state change listener
        unsubscribeRef.current = engine.onStateChange((state) => {
          console.log('[USE SYNC] State updated:', state);
          setSyncState(state);
        });
        
        // Initialize the engine
        await engine.initialize(user.id, groupId);
        
        // Get initial state
        const initialState = await engine.getSyncState();
        setSyncState(initialState);
        
        setIsInitialized(true);
        console.log('[USE SYNC] Engine initialized successfully');
        
      } catch (error) {
        console.error('[USE SYNC] Failed to initialize sync engine:', error);
        setIsInitialized(false);
      }
    };

    initializeEngine();

    // Cleanup on unmount or user change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (syncEngineRef.current) {
        syncEngineRef.current.destroy();
        syncEngineRef.current = null;
      }
      setIsInitialized(false);
      setSyncState(null);
    };
  }, [user, groupId]);

  // Update sync state periodically
  useEffect(() => {
    if (!isInitialized || !syncEngineRef.current) return;

    const interval = setInterval(async () => {
      try {
        const currentState = await syncEngineRef.current!.getSyncState();
        setSyncState(currentState);
      } catch (error) {
        console.error('[USE SYNC] Failed to update sync state:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  const startSync = useCallback(async () => {
    if (!syncEngineRef.current) return;
    
    try {
      await syncEngineRef.current.startSync();
    } catch (error) {
      console.error('[USE SYNC] Failed to start sync:', error);
    }
  }, []);

  const stopSync = useCallback(async () => {
    if (!syncEngineRef.current) return;
    
    try {
      await syncEngineRef.current.stopSync();
    } catch (error) {
      console.error('[USE SYNC] Failed to stop sync:', error);
    }
  }, []);

  const syncGroupData = useCallback(async (targetGroupId?: string) => {
    if (!syncEngineRef.current) return;
    
    const targetId = targetGroupId || groupId;
    if (!targetId) {
      console.warn('[USE SYNC] No group ID provided for sync');
      return;
    }
    
    try {
      await syncEngineRef.current.syncGroupData(targetId);
    } catch (error) {
      console.error('[USE SYNC] Failed to sync group data:', error);
    }
  }, [groupId]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: 'local' | 'remote') => {
    if (!syncEngineRef.current) return;
    
    try {
      // Find the conflict first
      const conflicts = await syncEngineRef.current.getConflicts();
      const conflict = conflicts.find(c => c.id === conflictId);
      
      if (!conflict) {
        console.error('[USE SYNC] Conflict not found:', conflictId);
        return;
      }

      // Map resolution to strategy
      const strategyMap = {
        'local': 'reject_remote' as const,
        'remote': 'last_write_wins' as const
      };
      
      await syncEngineRef.current.resolveConflict(conflict, strategyMap[resolution]);
    } catch (error) {
      console.error('[USE SYNC] Failed to resolve conflict:', error);
    }
  }, []);

  return {
    isInitialized,
    syncState,
    startSync,
    stopSync,
    syncGroupData,
    resolveConflict
  };
};
