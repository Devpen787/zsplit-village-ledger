
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSyncEngine } from '../useSyncEngine';
import { MockSyncEngine } from '@/adapters/sync/MockSyncEngine';
import { SyncEngineAdapter } from '@/adapters/sync/SyncEngineAdapter';

// Mock the auth context
const mockUser = { id: 'test-user-1', email: 'test@example.com', name: 'Test User' };

jest.mock('@/contexts', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock the storage adapter
jest.mock('@/adapters', () => ({
  storageAdapter: {
    getGroups: jest.fn(),
    getGroupById: jest.fn(),
    getGroupMembers: jest.fn(),
    getExpenses: jest.fn(),
    getPotActivities: jest.fn()
  }
}));

// Mock SyncEngineAdapter
jest.mock('@/adapters/sync', () => ({
  SyncEngineAdapter: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getSyncState: jest.fn().mockResolvedValue({
      status: 'synced',
      lastSync: Date.now(),
      conflicts: [],
      peers: [],
      pendingOperations: 0
    }),
    getConflicts: jest.fn().mockResolvedValue([]),
    startSync: jest.fn().mockResolvedValue(undefined),
    stopSync: jest.fn().mockResolvedValue(undefined),
    syncGroupData: jest.fn().mockResolvedValue(undefined),
    resolveConflict: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('useSyncEngine', () => {
  let mockAdapter: jest.Mocked<SyncEngineAdapter>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdapter = new SyncEngineAdapter({} as any) as jest.Mocked<SyncEngineAdapter>;
  });

  it('should initialize sync engine when user is available', async () => {
    const { result } = renderHook(() => useSyncEngine('test-group-1'));

    expect(result.current.isInitialized).toBe(false);

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(mockAdapter.initialize).toHaveBeenCalledWith('test-user-1', 'test-group-1');
  });

  it('should update sync state periodically', async () => {
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.syncState).toMatchObject({
      status: 'synced',
      lastSync: expect.any(Number),
      conflicts: [],
      peers: [],
      pendingOperations: 0
    });
  });

  it('should start sync', async () => {
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.startSync();
    });

    expect(mockAdapter.startSync).toHaveBeenCalled();
  });

  it('should stop sync', async () => {
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.stopSync();
    });

    expect(mockAdapter.stopSync).toHaveBeenCalled();
  });

  it('should sync group data', async () => {
    const groupId = 'test-group-1';
    const { result } = renderHook(() => useSyncEngine(groupId));

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.syncGroupData();
    });

    expect(mockAdapter.syncGroupData).toHaveBeenCalledWith(groupId);
  });

  it('should sync group data with provided target group ID', async () => {
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.syncGroupData('target-group-1');
    });

    expect(mockAdapter.syncGroupData).toHaveBeenCalledWith('target-group-1');
  });

  it('should resolve conflicts', async () => {
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.resolveConflict('conflict-1', 'local');
    });

    expect(mockAdapter.resolveConflict).toHaveBeenCalledWith('conflict-1', 'local');
  });

  it('should handle missing group ID warning', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { result } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.syncGroupData();
    });

    expect(consoleSpy).toHaveBeenCalledWith('[USE SYNC] No group ID provided for sync');
    consoleSpy.mockRestore();
  });

  it('should destroy sync engine on unmount', async () => {
    const { result, unmount } = renderHook(() => useSyncEngine());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    unmount();

    expect(mockAdapter.destroy).toHaveBeenCalled();
  });

  it('should not initialize without user', () => {
    // Mock no user
    jest.mocked(require('@/contexts').useAuth).mockReturnValue({ user: null });

    const { result } = renderHook(() => useSyncEngine());

    expect(result.current.isInitialized).toBe(false);
    expect(mockAdapter.initialize).not.toHaveBeenCalled();
  });
});
