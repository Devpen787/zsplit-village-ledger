
import { MockSyncEngine } from '../MockSyncEngine';
import { SyncEngineAdapter } from '../SyncEngineAdapter';
import { StorageAdapter } from '../../StorageAdapter';
import { SyncOperation, ConflictData } from '../types';

// Create a comprehensive mock storage adapter
const createMockStorageAdapter = (): jest.Mocked<StorageAdapter> => ({
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
  subscribeToChanges: jest.fn()
});

describe('SyncEngine Integration Tests', () => {
  let peer1Engine: MockSyncEngine;
  let peer2Engine: MockSyncEngine;
  let adapter1: SyncEngineAdapter;
  let adapter2: SyncEngineAdapter;
  let mockStorage1: jest.Mocked<StorageAdapter>;
  let mockStorage2: jest.Mocked<StorageAdapter>;

  const groupId = 'test-group-integration';
  const user1Id = 'user-1';
  const user2Id = 'user-2';

  beforeEach(async () => {
    localStorage.clear();
    
    // Create two peer engines
    peer1Engine = new MockSyncEngine();
    peer2Engine = new MockSyncEngine();
    
    // Create mock storage adapters
    mockStorage1 = createMockStorageAdapter();
    mockStorage2 = createMockStorageAdapter();
    
    // Create adapters
    adapter1 = new SyncEngineAdapter(mockStorage1, peer1Engine);
    adapter2 = new SyncEngineAdapter(mockStorage2, peer2Engine);
    
    // Initialize both adapters
    await adapter1.initialize(user1Id, groupId);
    await adapter2.initialize(user2Id, groupId);
  });

  afterEach(async () => {
    await adapter1.destroy();
    await adapter2.destroy();
  });

  describe('Multi-Peer Synchronization', () => {
    it('should sync data between two peers', async () => {
      // Set up mock data for peer 1
      const group1Data = [
        { id: 'group-1', name: 'Group 1', icon: '🏠', created_at: '2023-01-01', created_by: user1Id }
      ];
      
      const expenses1Data = [
        { id: 'expense-1', title: 'Lunch', amount: 25, currency: 'USD', date: '2023-01-01', paid_by: user1Id, group_id: groupId }
      ];

      mockStorage1.getGroups.mockResolvedValue(group1Data);
      mockStorage1.getGroupById.mockResolvedValue(group1Data[0]);
      mockStorage1.getGroupMembers.mockResolvedValue([]);
      mockStorage1.getExpenses.mockResolvedValue(expenses1Data);
      mockStorage1.getPotActivities.mockResolvedValue([]);

      // Set up mock data for peer 2
      const group2Data = [
        { id: 'group-1', name: 'Group 1 Updated', icon: '🏠', created_at: '2023-01-01', created_by: user1Id }
      ];

      mockStorage2.getGroups.mockResolvedValue(group2Data);
      mockStorage2.getGroupById.mockResolvedValue(group2Data[0]);
      mockStorage2.getGroupMembers.mockResolvedValue([]);
      mockStorage2.getExpenses.mockResolvedValue([]);
      mockStorage2.getPotActivities.mockResolvedValue([]);

      // Connect peers to each other
      await peer1Engine.connectToPeer(user2Id);
      await peer2Engine.connectToPeer(user1Id);

      // Start sync on both peers
      await adapter1.startSync();
      await adapter2.startSync();

      // Sync group data on both peers
      await adapter1.syncGroupData(groupId);
      await adapter2.syncGroupData(groupId);

      // Verify both peers have synced
      const state1 = await adapter1.getSyncState();
      const state2 = await adapter2.getSyncState();

      expect(state1.status).toBe('syncing');
      expect(state2.status).toBe('syncing');
      expect(state1.peers.length).toBe(1);
      expect(state2.peers.length).toBe(1);
    });

    it('should handle peer connections and disconnections', async () => {
      // Connect peers
      await peer1Engine.connectToPeer(user2Id);
      
      let peers1 = await peer1Engine.getPeers();
      expect(peers1).toHaveLength(1);
      expect(peers1[0].id).toBe(user2Id);
      expect(peers1[0].status).toBe('online');

      // Disconnect peer
      await peer1Engine.disconnectFromPeer(user2Id);
      
      peers1 = await peer1Engine.getPeers();
      expect(peers1[0].status).toBe('offline');
    });
  });

  describe('Conflict Detection and Resolution', () => {
    it('should detect and resolve concurrent edit conflicts', async () => {
      const conflictData = {
        id: '1',
        name: 'Test Item',
        description: 'Original description'
      };

      // Create concurrent versions
      const localVersion = peer1Engine.createVersion({
        ...conflictData,
        name: 'Local Edit',
        description: 'Local description'
      });

      const remoteVersion = peer2Engine.createVersion({
        ...conflictData,
        name: 'Remote Edit',
        description: 'Remote description'
      });

      // Simulate concurrent edits (close timestamps)
      localVersion.timestamp = 1000;
      remoteVersion.timestamp = 1100;
      localVersion.version = 1;
      remoteVersion.version = 2;

      // Detect conflict
      const conflict = peer1Engine.detectConflicts(localVersion, remoteVersion);
      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe('concurrent_edit');

      if (conflict) {
        // Resolve with merge strategy
        const resolved = await peer1Engine.resolveConflict(conflict, 'merge');
        expect(resolved.version).toBeGreaterThan(Math.max(localVersion.version, remoteVersion.version));
        expect(resolved.nodeId).toBe(user1Id);
      }
    });

    it('should handle different conflict resolution strategies', async () => {
      const localData = {
        id: '1',
        title: 'Local Title',
        amount: 100,
        version: 1,
        timestamp: 1000,
        nodeId: user1Id,
        checksum: 'local-checksum'
      };

      const remoteData = {
        id: '1',
        title: 'Remote Title',
        amount: 200,
        version: 1,
        timestamp: 1100,
        nodeId: user2Id,
        checksum: 'remote-checksum'
      };

      const conflict: ConflictData = {
        id: 'test-conflict',
        localVersion: localData,
        remoteVersion: remoteData,
        conflictType: 'concurrent_edit'
      };

      // Test last_write_wins (should choose remote as it's newer)
      const resolvedLWW = await peer1Engine.resolveConflict(conflict, 'last_write_wins');
      expect(resolvedLWW.title).toBe('Remote Title');

      // Test reject_remote (should choose local)
      const resolvedReject = await peer1Engine.resolveConflict(conflict, 'reject_remote');
      expect(resolvedReject.title).toBe('Local Title');

      // Test merge (should increment version)
      const resolvedMerge = await peer1Engine.resolveConflict(conflict, 'merge');
      expect(resolvedMerge.version).toBe(2);
    });
  });

  describe('Offline and Online Scenarios', () => {
    it('should handle offline editing and sync when back online', async () => {
      // Start in online mode
      await adapter1.startSync();
      
      let state = await adapter1.getSyncState();
      expect(state.status).toBe('syncing');

      // Go offline
      await adapter1.stopSync();
      
      state = await adapter1.getSyncState();
      expect(state.status).toBe('offline');

      // Make changes while offline
      const offlineExpense = {
        id: 'offline-expense',
        title: 'Offline Expense',
        amount: 50,
        currency: 'USD',
        date: '2023-01-01',
        paid_by: user1Id,
        group_id: groupId
      };

      mockStorage1.getExpenses.mockResolvedValue([offlineExpense]);
      mockStorage1.getGroupById.mockResolvedValue({ id: groupId, name: 'Test Group', icon: '🏠', created_at: '2023-01-01', created_by: user1Id });
      mockStorage1.getGroupMembers.mockResolvedValue([]);
      mockStorage1.getPotActivities.mockResolvedValue([]);

      // Come back online
      await adapter1.startSync();
      await adapter1.syncGroupData(groupId);

      state = await adapter1.getSyncState();
      expect(state.status).toBe('syncing');
    });

    it('should queue operations while offline', async () => {
      // Create operations while offline
      const operations: SyncOperation[] = [
        {
          id: 'op-1',
          type: 'create',
          table: 'expenses',
          recordId: 'expense-1',
          data: { title: 'Offline Expense 1', amount: 100 },
          metadata: {
            version: 1,
            timestamp: Date.now(),
            nodeId: user1Id,
            checksum: 'checksum-1'
          }
        },
        {
          id: 'op-2',
          type: 'update',
          table: 'expenses',
          recordId: 'expense-1',
          data: { title: 'Updated Offline Expense 1', amount: 150 },
          metadata: {
            version: 2,
            timestamp: Date.now(),
            nodeId: user1Id,
            checksum: 'checksum-2'
          }
        }
      ];

      // Push operations
      await peer1Engine.pushChanges(operations);

      // Verify operations are queued
      const queuedOps = await peer1Engine.pullChanges();
      expect(queuedOps).toHaveLength(2);
      expect(queuedOps[0].id).toBe('op-1');
      expect(queuedOps[1].id).toBe('op-2');
    });
  });

  describe('Version Tracking and Merging', () => {
    it('should track versions correctly across operations', () => {
      const originalData = { id: '1', title: 'Original Title', amount: 100 };
      
      // Create initial version
      const v1 = peer1Engine.createVersion(originalData);
      expect(v1.version).toBe(1);
      expect(v1.nodeId).toBe(user1Id);

      // Create updated version
      const updatedData = { ...originalData, title: 'Updated Title' };
      const v2 = peer1Engine.createVersion(updatedData);
      expect(v2.version).toBe(1); // Each createVersion starts at 1
      
      // Merge versions should increment
      const merged = peer1Engine.mergeVersions(v1, v2);
      expect(merged.version).toBe(2); // Max version + 1
    });

    it('should generate unique checksums for different data', () => {
      const data1 = { id: '1', title: 'Title 1' };
      const data2 = { id: '1', title: 'Title 2' };
      
      const v1 = peer1Engine.createVersion(data1);
      const v2 = peer1Engine.createVersion(data2);
      
      expect(v1.checksum).not.toBe(v2.checksum);
    });

    it('should handle timestamp-based conflict detection', () => {
      const baseData = { id: '1', title: 'Base Title' };
      
      const local = peer1Engine.createVersion(baseData);
      const remote = peer2Engine.createVersion(baseData);
      
      // Same timestamp = no conflict
      local.timestamp = 1000;
      remote.timestamp = 1000;
      local.version = 1;
      remote.version = 1;
      
      let conflict = peer1Engine.detectConflicts(local, remote);
      expect(conflict).toBeNull();

      // Different versions, close timestamps = conflict
      remote.version = 2;
      remote.timestamp = 1500; // Within 1000ms
      
      conflict = peer1Engine.detectConflicts(local, remote);
      expect(conflict).not.toBeNull();

      // Different versions, far timestamps = no conflict
      remote.timestamp = 3000; // More than 1000ms
      
      conflict = peer1Engine.detectConflicts(local, remote);
      expect(conflict).toBeNull();
    });
  });

  describe('Group-Level Operations', () => {
    it('should handle group joining and leaving', async () => {
      const newGroupId = 'new-group-id';
      
      // Join group
      await peer1Engine.joinGroup(newGroupId);
      
      // Sync the new group
      await peer1Engine.syncGroup(newGroupId);
      
      const state = await peer1Engine.getSyncState();
      expect(state.lastSync).toBeGreaterThan(0);
      
      // Leave group
      await peer1Engine.leaveGroup(newGroupId);
    });

    it('should sync all group-related data', async () => {
      const mockGroup = { id: groupId, name: 'Test Group', icon: '🏠', created_at: '2023-01-01', created_by: user1Id };
      const mockMembers = [{ id: '1', group_id: groupId, user_id: user1Id, role: 'admin', created_at: '2023-01-01' }];
      const mockExpenses = [{ id: '1', title: 'Test Expense', amount: 100, currency: 'USD', date: '2023-01-01', paid_by: user1Id, group_id: groupId }];
      const mockPotActivities = [{ id: '1', group_id: groupId, user_id: user1Id, type: 'contribution' as const, amount: 50, status: 'complete' as const, created_at: '2023-01-01' }];

      mockStorage1.getGroupById.mockResolvedValue(mockGroup);
      mockStorage1.getGroupMembers.mockResolvedValue(mockMembers);
      mockStorage1.getExpenses.mockResolvedValue(mockExpenses);
      mockStorage1.getPotActivities.mockResolvedValue(mockPotActivities);

      await adapter1.syncGroupData(groupId);

      expect(mockStorage1.getGroupById).toHaveBeenCalledWith(groupId);
      expect(mockStorage1.getGroupMembers).toHaveBeenCalledWith(groupId);
      expect(mockStorage1.getExpenses).toHaveBeenCalledWith(groupId);
      expect(mockStorage1.getPotActivities).toHaveBeenCalledWith(groupId);
    });
  });

  describe('Event System Integration', () => {
    it('should handle sync events across the system', async () => {
      const events: string[] = [];
      
      // Set up event listeners
      adapter1.onSyncEvent('sync_start', () => events.push('sync_start'));
      adapter1.onSyncEvent('sync_complete', () => events.push('sync_complete'));
      adapter1.onSyncEvent('data_updated', () => events.push('data_updated'));

      // Trigger sync operations
      await adapter1.startSync();
      
      const testData = [{ id: '1', name: 'Test Data' }];
      const metadata = {
        version: 1,
        timestamp: Date.now(),
        nodeId: user1Id,
        checksum: 'test-checksum'
      };

      await peer1Engine.syncData('test_table', testData, metadata);

      // Verify events were triggered
      expect(events).toContain('data_updated');
    });
  });
});
