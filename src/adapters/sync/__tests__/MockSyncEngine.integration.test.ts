
import { MockSyncEngine } from '../MockSyncEngine';
import { ConflictData, SyncState } from '../types';

describe('MockSyncEngine Integration Tests', () => {
  let syncEngine: MockSyncEngine;
  const testNodeId = 'test-node-1';
  const testGroupId = 'test-group-1';

  beforeEach(() => {
    syncEngine = new MockSyncEngine();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(async () => {
    await syncEngine.destroy();
    localStorage.clear();
  });

  describe('Initialization and State Management', () => {
    it('should initialize successfully', async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
      
      const state = await syncEngine.getSyncState();
      expect(state.status).toBe('synced');
      expect(state.peers).toHaveLength(2); // Mock peers
    });

    it('should persist state to localStorage', async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
      await syncEngine.startSync();
      
      // Check that state is persisted
      const persistedState = localStorage.getItem('mock-sync-engine-state');
      expect(persistedState).toBeTruthy();
      
      const parsed = JSON.parse(persistedState!);
      expect(parsed.status).toBe('synced');
    });

    it('should restore state from localStorage', async () => {
      // Set up initial state
      await syncEngine.initialize(testNodeId, testGroupId);
      await syncEngine.startSync();
      
      // Create new engine instance
      const newEngine = new MockSyncEngine();
      await newEngine.initialize(testNodeId, testGroupId);
      
      const state = await newEngine.getSyncState();
      expect(state.status).toBe('synced');
      
      await newEngine.destroy();
    });
  });

  describe('Sync Operations', () => {
    beforeEach(async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
    });

    it('should handle sync lifecycle correctly', async () => {
      const initialState = await syncEngine.getSyncState();
      expect(initialState.status).toBe('synced');

      await syncEngine.startSync();
      // Should eventually return to synced state
      await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for mock sync
      
      const finalState = await syncEngine.getSyncState();
      expect(finalState.status).toBe('synced');
      expect(finalState.lastSync).toBeGreaterThan(0);
    });

    it('should sync group data with progress tracking', async () => {
      const states: SyncState[] = [];
      
      // Listen for state changes
      const unsubscribe = syncEngine.onStateChange((state) => {
        states.push(state);
      });

      await syncEngine.syncGroupData(testGroupId);
      
      // Should have seen syncing and synced states
      const hasSync = states.some(s => s.status === 'syncing');
      const hasSynced = states.some(s => s.status === 'synced');
      
      expect(hasSync).toBe(true);
      expect(hasSynced).toBe(true);
      
      unsubscribe();
    });
  });

  describe('Conflict Management', () => {
    beforeEach(async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
    });

    it('should detect conflicts correctly', () => {
      const localData = {
        id: 'test-item',
        value: 'local-value',
        version: 2,
        timestamp: Date.now(),
        nodeId: 'local',
        checksum: 'local-checksum'
      };

      const remoteData = {
        id: 'test-item',
        value: 'remote-value',
        version: 2,
        timestamp: Date.now() - 500, // Earlier timestamp
        nodeId: 'remote',
        checksum: 'remote-checksum'
      };

      const conflict = syncEngine.detectConflicts(localData, remoteData);
      expect(conflict).toBeTruthy();
      expect(conflict?.conflictType).toBe('concurrent_edit');
    });

    it('should simulate and resolve conflicts', async () => {
      await syncEngine.simulateConflict();
      
      const conflicts = await syncEngine.getConflicts();
      expect(conflicts).toHaveLength(1);
      
      const conflict = conflicts[0];
      expect(conflict.type).toBe('expense');
      expect(conflict.conflictFields).toContain('title');
      expect(conflict.conflictFields).toContain('amount');

      // Resolve conflict
      const resolved = await syncEngine.resolveConflict(conflict, 'last_write_wins');
      expect(resolved).toBeTruthy();

      // Conflict should be removed
      const remainingConflicts = await syncEngine.getConflicts();
      expect(remainingConflicts).toHaveLength(0);
    });
  });

  describe('Peer Management', () => {
    beforeEach(async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
    });

    it('should manage peer connections', async () => {
      const initialPeers = await syncEngine.getPeers();
      expect(initialPeers).toHaveLength(2);

      await syncEngine.connectToPeer('new-peer');
      const updatedPeers = await syncEngine.getPeers();
      expect(updatedPeers).toHaveLength(3);

      await syncEngine.disconnectFromPeer('new-peer');
      const finalPeers = await syncEngine.getPeers();
      const disconnectedPeer = finalPeers.find(p => p.id === 'new-peer');
      expect(disconnectedPeer?.status).toBe('offline');
    });
  });

  describe('Guest User Management', () => {
    it('should create guest users with correct properties', async () => {
      const guestUser = await syncEngine.createGuestUser('Test Guest');
      
      expect(guestUser.temp_id).toMatch(/^guest-\d+-[a-z0-9]+$/);
      expect(guestUser.name).toBe('Test Guest');
      expect(new Date(guestUser.expires_at)).toBeInstanceOf(Date);
      expect(new Date(guestUser.created_at)).toBeInstanceOf(Date);
      
      // Should expire in approximately 24 hours
      const expirationTime = new Date(guestUser.expires_at).getTime();
      const creationTime = new Date(guestUser.created_at).getTime();
      const timeDiff = expirationTime - creationTime;
      const expectedDiff = 24 * 60 * 60 * 1000; // 24 hours in ms
      
      expect(Math.abs(timeDiff - expectedDiff)).toBeLessThan(1000); // Within 1 second
    });

    it('should upgrade guest users successfully', async () => {
      const guestUser = await syncEngine.createGuestUser('Test Guest');
      
      const success = await syncEngine.upgradeGuestUser(
        guestUser.temp_id,
        'new-user-123',
        'test@example.com'
      );
      
      expect(success).toBe(true);
    });

    it('should handle guest user edge cases', async () => {
      // Create guest without name
      const guestUser = await syncEngine.createGuestUser();
      expect(guestUser.name).toBe('Guest User');

      // Try to upgrade non-existent guest
      const success = await syncEngine.upgradeGuestUser(
        'non-existent-id',
        'user-123',
        'test@example.com'
      );
      expect(success).toBe(true); // Mock always returns true
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
    });

    it('should emit and handle events correctly', (done) => {
      let eventCount = 0;
      
      const unsubscribe = syncEngine.on('data_updated', (event) => {
        eventCount++;
        expect(event.type).toBe('data_updated');
        
        if (eventCount === 1) {
          unsubscribe();
          done();
        }
      });

      // Trigger an event
      syncEngine.startSync();
    });

    it('should handle event cleanup properly', () => {
      const callback = jest.fn();
      
      const unsubscribe = syncEngine.on('sync_complete', callback);
      unsubscribe();
      
      // Event should not be called after unsubscribe
      syncEngine.startSync();
      
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 100);
    });
  });

  describe('Version Control', () => {
    beforeEach(async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
    });

    it('should create versions with correct metadata', () => {
      const data = { name: 'Test Item', value: 42 };
      const versioned = syncEngine.createVersion(data);
      
      expect(versioned.version).toBe(1);
      expect(versioned.timestamp).toBeGreaterThan(0);
      expect(versioned.nodeId).toBe(testNodeId);
      expect(versioned.checksum).toBeTruthy();
      expect(versioned.name).toBe('Test Item');
      expect(versioned.value).toBe(42);
    });

    it('should merge versions correctly', () => {
      const local = {
        name: 'Local Item',
        version: 2,
        timestamp: Date.now() - 1000,
        nodeId: testNodeId,
        checksum: 'local-checksum'
      };

      const remote = {
        name: 'Remote Item',
        version: 3,
        timestamp: Date.now(),
        nodeId: 'remote-node',
        checksum: 'remote-checksum'
      };

      const merged = syncEngine.mergeVersions(local, remote);
      
      expect(merged.version).toBe(4); // Max version + 1
      expect(merged.nodeId).toBe(testNodeId); // Keeps local node ID
      expect(merged.name).toBe('Remote Item'); // Uses remote data
      expect(merged.timestamp).toBeGreaterThan(remote.timestamp);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle operations before initialization', async () => {
      // Should throw error when not initialized
      await expect(syncEngine.startSync()).rejects.toThrow('not initialized');
      await expect(syncEngine.getSyncState()).rejects.toThrow('not initialized');
      await expect(syncEngine.getConflicts()).rejects.toThrow('not initialized');
    });

    it('should handle localStorage failures gracefully', async () => {
      // Mock localStorage failure
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      await syncEngine.initialize(testNodeId, testGroupId);
      await syncEngine.startSync(); // Should not throw

      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });

    it('should handle concurrent operations', async () => {
      await syncEngine.initialize(testNodeId, testGroupId);
      
      // Start multiple sync operations concurrently
      const promises = [
        syncEngine.startSync(),
        syncEngine.syncGroupData(testGroupId),
        syncEngine.startSync()
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});
