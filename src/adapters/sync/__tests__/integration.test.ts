
import { MockSyncEngine } from '../MockSyncEngine';
import { SyncEngineAdapter } from '../SyncEngineAdapter';
import { StorageAdapter } from '../../StorageAdapter';
import { ConflictData, SyncMetadata } from '../types';

// Mock storage adapter
const mockStorageAdapter: jest.Mocked<StorageAdapter> = {
  getCurrentUser: jest.fn(),
  getCurrentSession: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  getGroups: jest.fn(),
  getGroupById: jest.fn(),
  createGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  getGroupMembers: jest.fn(),
  addGroupMember: jest.fn(),
  removeGroupMember: jest.fn(),
  updateMemberRole: jest.fn(),
  isGroupMember: jest.fn(),
  isGroupAdmin: jest.fn(),
  getExpenses: jest.fn(),
  getExpenseById: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  calculateBalances: jest.fn(),
  getPotActivities: jest.fn(),
  createPotActivity: jest.fn(),
  updatePotActivity: jest.fn(),
  getInvitations: jest.fn(),
  createInvitation: jest.fn(),
  updateInvitation: jest.fn(),
  invokeEdgeFunction: jest.fn(),
  subscribeToChanges: jest.fn(),
};

describe('SyncEngine Integration Tests', () => {
  let syncEngine1: MockSyncEngine;
  let syncEngine2: MockSyncEngine;
  let adapter1: SyncEngineAdapter;
  let adapter2: SyncEngineAdapter;

  beforeEach(async () => {
    // Clear localStorage between tests
    localStorage.clear();
    
    // Initialize two sync engines to simulate peers
    syncEngine1 = new MockSyncEngine();
    syncEngine2 = new MockSyncEngine();
    
    adapter1 = new SyncEngineAdapter(mockStorageAdapter, syncEngine1);
    adapter2 = new SyncEngineAdapter(mockStorageAdapter, syncEngine2);
    
    await adapter1.initialize('user1', 'group1');
    await adapter2.initialize('user2', 'group1');
  });

  afterEach(async () => {
    await adapter1.destroy();
    await adapter2.destroy();
  });

  describe('Multi-peer synchronization', () => {
    it('should sync data between two peers', async () => {
      // Setup mock data
      const mockGroup = { id: 'group1', name: 'Test Group', icon: '🏠', created_at: '2023-01-01', created_by: 'user1' };
      const mockExpenses = [
        { id: 'exp1', title: 'Lunch', amount: 25.50, currency: 'USD', date: '2023-01-01', paid_by: 'user1' }
      ];

      mockStorageAdapter.getGroupById.mockResolvedValue(mockGroup);
      mockStorageAdapter.getGroupMembers.mockResolvedValue([]);
      mockStorageAdapter.getExpenses.mockResolvedValue(mockExpenses);
      mockStorageAdapter.getPotActivities.mockResolvedValue([]);

      // Start sync on both engines
      await adapter1.startSync();
      await adapter2.startSync();

      // Sync data from adapter1
      await adapter1.syncGroupData('group1');

      // Wait for sync propagation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify both engines have synced states
      const state1 = await adapter1.getSyncState();
      const state2 = await adapter2.getSyncState();

      expect(state1.status).toBe('synced');
      expect(state2.status).toBe('synced');
      expect(state1.peers.length).toBeGreaterThan(0);
      expect(state2.peers.length).toBeGreaterThan(0);
    });

    it('should handle peer connections and disconnections', async () => {
      await adapter1.startSync();
      await adapter2.startSync();

      // Wait for peer discovery
      await new Promise(resolve => setTimeout(resolve, 50));

      const state1 = await adapter1.getSyncState();
      expect(state1.peers.length).toBe(1);

      // Disconnect one peer
      await adapter2.stopSync();
      await new Promise(resolve => setTimeout(resolve, 50));

      const finalState = await adapter1.getSyncState();
      expect(finalState.peers.length).toBe(0);
    });
  });

  describe('Conflict detection and resolution', () => {
    it('should detect conflicts when same data is modified by different peers', async () => {
      const conflictingData1 = {
        id: '1',
        name: 'Local Name',
        description: 'Local Description',
        version: 1,
        timestamp: 1000000000000,
        nodeId: 'node1',
        checksum: 'local-checksum'
      };

      const conflictingData2 = {
        id: '1',
        name: 'Remote Name',
        description: 'Remote Description',
        version: 2,
        timestamp: 1000000001000,
        nodeId: 'node2',
        checksum: 'remote-checksum'
      };

      // Create data on both engines
      await syncEngine1.syncData('test_table', [conflictingData1], conflictingData1);
      await syncEngine2.syncData('test_table', [conflictingData2], conflictingData2);

      // Start sync to trigger conflict detection
      await adapter1.startSync();
      await adapter2.startSync();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Check for conflicts
      const conflicts1 = await adapter1.getConflicts();
      const conflicts2 = await adapter2.getConflicts();

      expect(conflicts1.length).toBeGreaterThan(0);
      expect(conflicts2.length).toBeGreaterThan(0);
    });

    it('should resolve conflicts using different strategies', async () => {
      // Create a conflict
      const conflictData: ConflictData = {
        id: 'conflict-1',
        localVersion: {
          id: '1',
          name: 'Local',
          description: 'Local version',
          version: 1,
          timestamp: 1000000000000,
          nodeId: 'node1',
          checksum: 'local'
        },
        remoteVersion: {
          id: '1',
          name: 'Remote',
          description: 'Remote version',
          version: 2,
          timestamp: 1000000001000,
          nodeId: 'node2',
          checksum: 'remote'
        },
        conflictType: 'concurrent_edit'
      };

      // Add conflict to engine
      syncEngine1['conflicts'].set('conflict-1', conflictData);

      // Resolve using local strategy
      await adapter1.resolveConflict('conflict-1', 'local');

      const remainingConflicts = await adapter1.getConflicts();
      expect(remainingConflicts.length).toBe(0);
    });
  });

  describe('Offline editing and sync', () => {
    it('should queue operations when offline and sync when online', async () => {
      // Start in offline mode
      await adapter1.stopSync();

      const testData = {
        id: 'offline-1',
        name: 'Offline Edit',
        description: 'Created while offline',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'node1',
        checksum: 'offline-checksum'
      };

      // Make changes while offline
      await syncEngine1.syncData('offline_table', [testData], testData);

      const offlineState = await adapter1.getSyncState();
      expect(offlineState.status).toBe('offline');
      expect(offlineState.pendingOperations).toBeGreaterThan(0);

      // Go back online
      await adapter1.startSync();
      await new Promise(resolve => setTimeout(resolve, 100));

      const onlineState = await adapter1.getSyncState();
      expect(onlineState.status).toBe('synced');
      expect(onlineState.pendingOperations).toBe(0);
    });
  });

  describe('Version tracking and merging', () => {
    it('should track versions correctly across sync operations', async () => {
      const baseData = { id: 'version-test', name: 'Base', description: 'Base version' };
      
      const versioned1 = syncEngine1.createVersion(baseData);
      const versioned2 = syncEngine1.createVersion({ ...baseData, name: 'Updated' });

      expect(versioned1.version).toBe(1);
      expect(versioned2.version).toBe(2);
      expect(versioned2.timestamp).toBeGreaterThan(versioned1.timestamp);
    });

    it('should merge versions when possible', async () => {
      const localData = {
        id: 'merge-test',
        name: 'Local Name',
        description: 'Local Description',
        version: 1,
        timestamp: 1000000000000,
        nodeId: 'node1',
        checksum: 'local'
      };

      const remoteData = {
        id: 'merge-test',
        name: 'Remote Name',
        description: 'Local Description', // Same description
        version: 1,
        timestamp: 1000000001000,
        nodeId: 'node2',
        checksum: 'remote'
      };

      const merged = syncEngine1.mergeVersions(localData, remoteData);
      
      expect(merged.id).toBe('merge-test');
      expect(merged.version).toBeGreaterThan(1);
      expect(merged.timestamp).toBeGreaterThan(localData.timestamp);
    });
  });

  describe('Data persistence across sessions', () => {
    it('should persist sync state and restore on initialization', async () => {
      const testData = {
        id: 'persist-test',
        name: 'Persistent Data',
        description: 'Should survive restart',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'node1',
        checksum: 'persist-checksum'
      };

      await syncEngine1.syncData('persistent_table', [testData], testData);
      
      // Simulate restart
      await adapter1.destroy();
      
      const newEngine = new MockSyncEngine();
      const newAdapter = new SyncEngineAdapter(mockStorageAdapter, newEngine);
      await newAdapter.initialize('user1', 'group1');
      
      // Check if data persisted
      const state = await newAdapter.getSyncState();
      expect(state).toBeDefined();
      
      await newAdapter.destroy();
    });
  });
});
