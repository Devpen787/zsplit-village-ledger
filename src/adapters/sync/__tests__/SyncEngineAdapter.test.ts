
import { SyncEngineAdapter } from '../SyncEngineAdapter';
import { MockSyncEngine } from '../MockSyncEngine';
import { StorageAdapter } from '../../StorageAdapter';
import { ConflictData } from '../types';

// Mock StorageAdapter
const mockStorageAdapter: jest.Mocked<StorageAdapter> = {
  getGroups: jest.fn(),
  getGroupById: jest.fn(),
  getGroupMembers: jest.fn(),
  getExpenses: jest.fn(),
  getPotActivities: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentSession: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  createGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  addGroupMember: jest.fn(),
  removeGroupMember: jest.fn(),
  updateMemberRole: jest.fn(),
  isGroupMember: jest.fn(),
  isGroupAdmin: jest.fn(),
  getExpenseById: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  calculateBalances: jest.fn(),
  createPotActivity: jest.fn(),
  updatePotActivity: jest.fn(),
  getInvitations: jest.fn(),
  createInvitation: jest.fn(),
  updateInvitation: jest.fn(),
  invokeEdgeFunction: jest.fn(),
  subscribeToChanges: jest.fn()
};

describe('SyncEngineAdapter', () => {
  let adapter: SyncEngineAdapter;
  let mockSyncEngine: MockSyncEngine;
  const userId = 'test-user-1';
  const groupId = 'test-group-1';

  beforeEach(async () => {
    mockSyncEngine = new MockSyncEngine();
    adapter = new SyncEngineAdapter(mockStorageAdapter, mockSyncEngine);
    await adapter.initialize(userId, groupId);
  });

  afterEach(async () => {
    await adapter.destroy();
  });

  describe('Initialization', () => {
    it('should initialize sync engine and set up event listeners', async () => {
      const newAdapter = new SyncEngineAdapter(mockStorageAdapter);
      
      // Should use MockSyncEngine by default
      await newAdapter.initialize(userId);
      
      const state = await newAdapter.getSyncState();
      expect(state.status).toBe('synced');
      
      await newAdapter.destroy();
    });
  });

  describe('Group Synchronization', () => {
    it('should sync user groups', async () => {
      const mockGroups = [
        { id: 'group-1', name: 'Test Group 1', icon: '🏠', created_at: '2023-01-01', created_by: userId },
        { id: 'group-2', name: 'Test Group 2', icon: '🏢', created_at: '2023-01-02', created_by: userId }
      ];

      mockStorageAdapter.getGroups.mockResolvedValue(mockGroups);

      await adapter.syncGroups(userId);

      expect(mockStorageAdapter.getGroups).toHaveBeenCalledWith(userId);
    });

    it('should sync complete group data', async () => {
      const mockGroup = { id: groupId, name: 'Test Group', icon: '🏠', created_at: '2023-01-01', created_by: userId };
      const mockMembers = [{ id: '1', group_id: groupId, user_id: userId, role: 'admin', created_at: '2023-01-01' }];
      const mockExpenses = [{ id: '1', title: 'Test Expense', amount: 100, currency: 'USD', date: '2023-01-01', paid_by: userId, group_id: groupId }];
      const mockPotActivities = [{ id: '1', group_id: groupId, user_id: userId, type: 'contribution' as const, amount: 50, status: 'complete' as const, created_at: '2023-01-01' }];

      mockStorageAdapter.getGroupById.mockResolvedValue(mockGroup);
      mockStorageAdapter.getGroupMembers.mockResolvedValue(mockMembers);
      mockStorageAdapter.getExpenses.mockResolvedValue(mockExpenses);
      mockStorageAdapter.getPotActivities.mockResolvedValue(mockPotActivities);

      await adapter.syncGroupData(groupId);

      expect(mockStorageAdapter.getGroupById).toHaveBeenCalledWith(groupId);
      expect(mockStorageAdapter.getGroupMembers).toHaveBeenCalledWith(groupId);
      expect(mockStorageAdapter.getExpenses).toHaveBeenCalledWith(groupId);
      expect(mockStorageAdapter.getPotActivities).toHaveBeenCalledWith(groupId);
    });
  });

  describe('Sync State Management', () => {
    it('should get sync state', async () => {
      const state = await adapter.getSyncState();
      
      expect(state).toMatchObject({
        status: expect.any(String),
        lastSync: expect.any(Number),
        conflicts: expect.any(Array),
        peers: expect.any(Array),
        pendingOperations: expect.any(Number)
      });
    });

    it('should start and stop sync', async () => {
      await adapter.startSync();
      let state = await adapter.getSyncState();
      expect(state.status).toBe('syncing');

      await adapter.stopSync();
      state = await adapter.getSyncState();
      expect(state.status).toBe('offline');
    });
  });

  describe('Conflict Resolution', () => {
    it('should get conflicts', async () => {
      const conflicts = await adapter.getConflicts();
      expect(Array.isArray(conflicts)).toBe(true);
    });

    it('should resolve conflicts with different strategies', async () => {
      // Create a mock conflict
      const mockConflict: ConflictData = {
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

      // Mock the sync engine to return this conflict
      jest.spyOn(mockSyncEngine, 'getConflicts').mockResolvedValue([mockConflict]);
      jest.spyOn(mockSyncEngine, 'resolveConflict').mockResolvedValue(mockConflict.localVersion);

      await adapter.resolveConflict('conflict-1', 'local');

      expect(mockSyncEngine.resolveConflict).toHaveBeenCalledWith(mockConflict, 'reject_remote');
    });

    it('should throw error for non-existent conflict', async () => {
      jest.spyOn(mockSyncEngine, 'getConflicts').mockResolvedValue([]);

      await expect(adapter.resolveConflict('non-existent', 'local'))
        .rejects.toThrow('Conflict non-existent not found');
    });
  });

  describe('Event Handling', () => {
    it('should register event listeners', () => {
      const callback = jest.fn();
      
      const unsubscribe = adapter.onSyncEvent('sync_complete', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Metadata Creation', () => {
    it('should create metadata with correct structure', () => {
      const metadata = (adapter as any).createMetadata();
      
      expect(metadata).toMatchObject({
        version: 1,
        timestamp: expect.any(Number),
        nodeId: 'local',
        checksum: expect.any(String)
      });
    });
  });
});
