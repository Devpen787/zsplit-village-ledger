
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SyncDashboard from '../SyncDashboard';
import { useSyncEngine } from '@/hooks/useSyncEngine';

// Mock the useSyncEngine hook
jest.mock('@/hooks/useSyncEngine');

const mockUseSyncEngine = useSyncEngine as jest.MockedFunction<typeof useSyncEngine>;

describe('SyncDashboard', () => {
  const defaultMockReturn = {
    isInitialized: true,
    syncState: {
      status: 'synced' as const,
      lastSync: Date.now(),
      conflicts: [],
      peers: [],
      pendingOperations: 0
    },
    startSync: jest.fn(),
    stopSync: jest.fn(),
    syncGroupData: jest.fn(),
    resolveConflict: jest.fn()
  };

  beforeEach(() => {
    mockUseSyncEngine.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state when not initialized', () => {
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      isInitialized: false
    });

    render(<SyncDashboard />);
    
    expect(screen.getByText('Initializing sync engine...')).toBeInTheDocument();
  });

  it('should render sync status and controls when initialized', () => {
    render(<SyncDashboard />);
    
    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Start Sync')).toBeInTheDocument();
    expect(screen.getByText('Sync Group Data')).toBeInTheDocument();
  });

  it('should show stop sync button when syncing', () => {
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncState: {
        ...defaultMockReturn.syncState!,
        status: 'syncing',
        pendingOperations: 3
      }
    });

    render(<SyncDashboard />);
    
    expect(screen.getByText('Stop Sync')).toBeInTheDocument();
    expect(screen.getByText('Syncing data...')).toBeInTheDocument();
    expect(screen.getByText('3 operations remaining')).toBeInTheDocument();
  });

  it('should display peer connections', () => {
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncState: {
        ...defaultMockReturn.syncState!,
        peers: [
          { id: 'peer-1', status: 'connected', lastSeen: Date.now() },
          { id: 'peer-2', status: 'disconnected', lastSeen: Date.now() - 5000 }
        ]
      }
    });

    render(<SyncDashboard />);
    
    expect(screen.getByText('Connected Peers')).toBeInTheDocument();
    expect(screen.getByText('Peer peer-1')).toBeInTheDocument();
    expect(screen.getByText('Peer peer-2')).toBeInTheDocument();
  });

  it('should display conflicts when present', () => {
    const mockConflict = {
      id: 'conflict-1',
      type: 'expense' as const,
      entityId: 'expense-123',
      localVersion: {
        title: 'Local Title',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'local',
        checksum: 'local-checksum'
      },
      remoteVersion: {
        title: 'Remote Title',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'remote',
        checksum: 'remote-checksum'
      },
      conflictType: 'concurrent_edit' as const,
      conflictFields: ['title']
    };

    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncState: {
        ...defaultMockReturn.syncState!,
        status: 'conflict',
        conflicts: [mockConflict]
      }
    });

    render(<SyncDashboard />);
    
    expect(screen.getByText('Sync Conflicts')).toBeInTheDocument();
    expect(screen.getByText('Expense Conflict')).toBeInTheDocument();
    expect(screen.getByText('Fields: title')).toBeInTheDocument();
  });

  it('should call startSync when start sync button is clicked', async () => {
    const mockStartSync = jest.fn();
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      startSync: mockStartSync
    });

    render(<SyncDashboard />);
    
    fireEvent.click(screen.getByText('Start Sync'));
    
    expect(mockStartSync).toHaveBeenCalledTimes(1);
  });

  it('should call syncGroupData when sync group data button is clicked', async () => {
    const mockSyncGroupData = jest.fn();
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncGroupData: mockSyncGroupData
    });

    render(<SyncDashboard groupId="test-group" />);
    
    fireEvent.click(screen.getByText('Sync Group Data'));
    
    expect(mockSyncGroupData).toHaveBeenCalledWith('test-group');
  });

  it('should open conflict resolution dialog when resolve button is clicked', async () => {
    const mockConflict = {
      id: 'conflict-1',
      type: 'expense' as const,
      entityId: 'expense-123',
      localVersion: {
        title: 'Local Title',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'local',
        checksum: 'local-checksum'
      },
      remoteVersion: {
        title: 'Remote Title',
        version: 1,
        timestamp: Date.now(),
        nodeId: 'remote',
        checksum: 'remote-checksum'
      },
      conflictType: 'concurrent_edit' as const,
      conflictFields: ['title']
    };

    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncState: {
        ...defaultMockReturn.syncState!,
        conflicts: [mockConflict]
      }
    });

    render(<SyncDashboard />);
    
    fireEvent.click(screen.getByText('Resolve'));
    
    // Should open the conflict resolution dialog
    await waitFor(() => {
      expect(screen.getByText('Sync Conflict Detected')).toBeInTheDocument();
    });
  });

  it('should display sync statistics correctly', () => {
    mockUseSyncEngine.mockReturnValue({
      ...defaultMockReturn,
      syncState: {
        ...defaultMockReturn.syncState!,
        lastSync: Date.now(),
        peers: [
          { id: 'peer-1', status: 'connected', lastSeen: Date.now() },
          { id: 'peer-2', status: 'connected', lastSeen: Date.now() }
        ],
        conflicts: [],
        pendingOperations: 0
      }
    });

    render(<SyncDashboard />);
    
    expect(screen.getByText('Sync Statistics')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument(); // Last sync indicator
    expect(screen.getByText('2')).toBeInTheDocument(); // Connected peers count
    expect(screen.getByText('0')).toBeInTheDocument(); // Conflicts count
  });

  it('should simulate conflicts when simulate button is clicked', () => {
    render(<SyncDashboard />);
    
    fireEvent.click(screen.getByText('Simulate Conflict'));
    
    // Should create a mock conflict (this is handled internally)
    // The component should show the conflict resolution dialog
    expect(screen.getByText('Sync Conflict Detected')).toBeInTheDocument();
  });
});
