
import { MockSyncEngine } from '../MockSyncEngine';
import { SyncMetadata, ConflictData, SyncOperation } from '../types';

describe('MockSyncEngine', () => {
  let syncEngine: MockSyncEngine;
  const nodeId = 'test-node-1';
  const groupId = 'test-group-1';

  beforeEach(async () => {
    syncEngine = new MockSyncEngine();
    localStorage.clear();
    await syncEngine.initialize(nodeId, groupId);
  });

  afterEach(async () => {
    await syncEngine.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with correct node and group IDs', async () => {
      const state = await syncEngine.getSyncState();
      expect(state.status).toBe('synced');
    });

    it('should throw error when calling methods before initialization', async () => {
      const uninitializedEngine = new MockSyncEngine();
      await expect(uninitializedEngine.startSync()).rejects.toThrow('SyncEngine not initialized');
    });
  });

  describe('Sync Operations', () => {
    it('should start and stop sync correctly', async () => {
      await syncEngine.startSync();
      let state = await syncEngine.getSyncState();
      expect(state.status).toBe('syncing');

      await syncEngine.stopSync();
      state = await syncEngine.getSyncState();
      expect(state.status).toBe('offline');
    });

    it('should sync data and emit events', async () => {
      const eventPromise = new Promise((resolve) => {
        syncEngine.on('data_updated', resolve);
      });

      const testData = [{ id: '1', name: 'Test Item' }];
      const metadata: SyncMetadata = {
        version: 1,
        timestamp: Date.now(),
        nodeId,
        checksum: 'test-checksum'
      };

      await syncEngine.syncData('test_table', testData, metadata);
      const event = await eventPromise;
      
      expect(event).toEqual({
        type: 'data_updated',
        data: testData,
        metadata
      });
    });

    it('should handle group sync operations', async () => {
      const eventPromise = new Promise((resolve) => {
        syncEngine.on('sync_complete', resolve);
      });

      await syncEngine.syncGroup(groupId);
      await eventPromise;

      const state = await syncEngine.getSyncState();
      expect(state.lastSync).toBeGreaterThan(0);
    });
  });

  describe('Version Management', () => {
    it('should create versions with correct metadata', () => {
      const testData = { name: 'Test Item' };
      const versioned = syncEngine.createVersion(testData);

      expect(versioned).toMatchObject({
        name: 'Test Item',
        version: 1,
        nodeId,
        timestamp: expect.any(Number),
        checksum: expect.any(String)
      });
    });

    it('should merge versions correctly', () => {
      const localData = {
        id: '1',
        name: 'Local Name',
        description: 'Local Desc',
        version: 1,
        timestamp: 1000,
        nodeId: 'node1',
        checksum: 'local-checksum'
      };

      const remoteData = {
        id: '1',
        name: 'Remote Name',
        description: 'Remote Desc',
        version: 2,
        timestamp: 2000,
        nodeId: 'node2',
        checksum: 'remote-checksum'
      };

      const merged = syncEngine.mergeVersions(localData, remoteData);

      expect(merged.name).toBe('Remote Name'); // Remote is newer
      expect(merged.version).toBe(3); // Version incremented
      expect(merged.nodeId).toBe(nodeId); // Current node ID
    });
  });

  describe('Conflict Detection and Resolution', () => {
    it('should detect concurrent edit conflicts', () => {
      const localData = {
        id: '1',
        name: 'Local Name',
        version: 1,
        timestamp: 1000,
        nodeId: 'node1',
        checksum: 'checksum1'
      };

      const remoteData = {
        id: '1',
        name: 'Remote Name',
        version: 2,
        timestamp: 1100, // Within 1000ms difference
        nodeId: 'node2',
        checksum: 'checksum2'
      };

      const conflict = syncEngine.detectConflicts(localData, remoteData);
      
      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe('concurrent_edit');
      expect(conflict?.localVersion).toEqual(localData);
      expect(conflict?.remoteVersion).toEqual(remoteData);
    });

    it('should not detect conflicts for non-concurrent edits', () => {
      const localData = {
        id: '1',
        name: 'Local Name',
        version: 1,
        timestamp: 1000,
        nodeId: 'node1',
        checksum: 'checksum1'
      };

      const remoteData = {
        id: '1',
        name: 'Remote Name',
        version: 1,
        timestamp: 3000, // More than 1000ms difference
        nodeId: 'node2',
        checksum: 'checksum2'
      };

      const conflict = syncEngine.detectConflicts(localData, remoteData);
      expect(conflict).toBeNull();
    });

    it('should resolve conflicts with different strategies', async () => {
      const conflict: ConflictData = {
        id: 'conflict-1',
        localVersion: {
          id: '1',
          name: 'Local Name',
          version: 1,
          timestamp: 1000,
          nodeId: 'node1',
          checksum: 'local'
        },
        remoteVersion: {
          id: '1',
          name: 'Remote Name',
          version: 1,
          timestamp: 2000,
          nodeId: 'node2',
          checksum: 'remote'
        },
        conflictType: 'concurrent_edit'
      };

      // Test last_write_wins strategy
      const resolved1 = await syncEngine.resolveConflict(conflict, 'last_write_wins');
      expect(resolved1.name).toBe('Remote Name'); // Remote is newer

      // Test reject_remote strategy
      const resolved2 = await syncEngine.resolveConflict(conflict, 'reject_remote');
      expect(resolved2.name).toBe('Local Name');

      // Test merge strategy
      const resolved3 = await syncEngine.resolveConflict(conflict, 'merge');
      expect(resolved3.version).toBeGreaterThan(1); // Version should be incremented
    });
  });

  describe('Peer Management', () => {
    it('should connect and disconnect peers', async () => {
      const peerId = 'peer-1';
      
      let eventPromise = new Promise((resolve) => {
        syncEngine.on('peer_connected', resolve);
      });

      await syncEngine.connectToPeer(peerId);
      const connectEvent = await eventPromise;
      expect(connectEvent).toEqual({ type: 'peer_connected', peerId });

      const peers = await syncEngine.getPeers();
      expect(peers).toHaveLength(1);
      expect(peers[0].id).toBe(peerId);
      expect(peers[0].status).toBe('online');

      eventPromise = new Promise((resolve) => {
        syncEngine.on('peer_disconnected', resolve);
      });

      await syncEngine.disconnectFromPeer(peerId);
      const disconnectEvent = await eventPromise;
      expect(disconnectEvent).toEqual({ type: 'peer_disconnected', peerId });

      const updatedPeers = await syncEngine.getPeers();
      expect(updatedPeers[0].status).toBe('offline');
    });

    it('should not duplicate peer connections', async () => {
      const peerId = 'peer-1';
      
      await syncEngine.connectToPeer(peerId);
      await syncEngine.connectToPeer(peerId); // Connect again
      
      const peers = await syncEngine.getPeers();
      expect(peers).toHaveLength(1);
    });
  });

  describe('Data Operations', () => {
    it('should push and pull changes', async () => {
      const operations: SyncOperation[] = [
        {
          id: 'op-1',
          type: 'create',
          table: 'expenses',
          recordId: 'expense-1',
          data: { title: 'Test Expense', amount: 100 },
          metadata: {
            version: 1,
            timestamp: Date.now(),
            nodeId,
            checksum: 'checksum'
          }
        }
      ];

      await syncEngine.pushChanges(operations);
      
      const pulledChanges = await syncEngine.pullChanges();
      expect(pulledChanges).toHaveLength(1);
      expect(pulledChanges[0].id).toBe('op-1');
    });

    it('should filter changes by timestamp when pulling', async () => {
      const oldOperation: SyncOperation = {
        id: 'op-old',
        type: 'create',
        table: 'expenses',
        recordId: 'expense-old',
        data: { title: 'Old Expense' },
        metadata: {
          version: 1,
          timestamp: 1000,
          nodeId,
          checksum: 'old-checksum'
        }
      };

      const newOperation: SyncOperation = {
        id: 'op-new',
        type: 'create',
        table: 'expenses',
        recordId: 'expense-new',
        data: { title: 'New Expense' },
        metadata: {
          version: 1,
          timestamp: 3000,
          nodeId,
          checksum: 'new-checksum'
        }
      };

      await syncEngine.pushChanges([oldOperation, newOperation]);
      
      const recentChanges = await syncEngine.pullChanges(2000);
      expect(recentChanges).toHaveLength(1);
      expect(recentChanges[0].id).toBe('op-new');
    });
  });

  describe('Group Operations', () => {
    it('should join and leave groups', async () => {
      const newGroupId = 'new-group';
      
      await syncEngine.joinGroup(newGroupId);
      // In mock implementation, this just logs the action
      
      await syncEngine.leaveGroup(newGroupId);
      // In mock implementation, this just logs the action
    });
  });

  describe('Event System', () => {
    it('should register and unregister event listeners', () => {
      const callback = jest.fn();
      
      const unsubscribe = syncEngine.on('sync_complete', callback);
      syncEngine.off('sync_complete', callback);
      
      // Manually emit event to test unregistration
      (syncEngine as any).emit('sync_complete', {});
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call multiple listeners for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      syncEngine.on('sync_complete', callback1);
      syncEngine.on('sync_complete', callback2);
      
      // Manually emit event
      (syncEngine as any).emit('sync_complete', {});
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', async () => {
      await syncEngine.startSync();
      
      // Trigger a sync operation to update state
      await syncEngine.syncGroup(groupId);
      
      // Check if state is persisted
      const stored = localStorage.getItem('mock-sync-engine-data');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsedState = JSON.parse(stored);
        expect(parsedState.lastSync).toBeGreaterThan(0);
      }
    });

    it('should load state from localStorage on initialization', async () => {
      // Pre-populate localStorage
      const initialState = {
        status: 'synced',
        lastSync: 12345,
        conflicts: [],
        peers: [],
        pendingOperations: 0
      };
      
      localStorage.setItem('mock-sync-engine-data', JSON.stringify(initialState));
      
      const newEngine = new MockSyncEngine();
      await newEngine.initialize('test-node-2');
      
      const state = await newEngine.getSyncState();
      expect(state.lastSync).toBe(12345);
      
      await newEngine.destroy();
    });
  });
});
