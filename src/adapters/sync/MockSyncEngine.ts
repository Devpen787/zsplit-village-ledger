
import { SyncState, SyncConflict, SyncOperation, GuestUser, ExpenseConflict } from './types';

export class MockSyncEngine {
  private syncState: SyncState = {
    status: 'idle',
    lastSync: null,
    conflicts: [],
    peers: [],
    pendingOperations: 0
  };

  private operations: SyncOperation[] = [];
  private listeners: ((state: SyncState) => void)[] = [];

  async initialize(userId: string, groupId?: string): Promise<void> {
    console.log('[MockSyncEngine] Initializing for user:', userId, 'group:', groupId);
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.syncState = {
      ...this.syncState,
      status: 'synced',
      lastSync: Date.now(),
      peers: [
        { id: 'peer-1', status: 'connected', lastSeen: Date.now() },
        { id: 'peer-2', status: 'connected', lastSeen: Date.now() - 5000 }
      ]
    };
    
    this.notifyListeners();
  }

  async getSyncState(): Promise<SyncState> {
    return { ...this.syncState };
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return [...this.syncState.conflicts];
  }

  async startSync(): Promise<void> {
    console.log('[MockSyncEngine] Starting sync...');
    this.syncState.status = 'syncing';
    this.notifyListeners();
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.syncState.status = 'synced';
    this.syncState.lastSync = Date.now();
    this.notifyListeners();
  }

  async stopSync(): Promise<void> {
    console.log('[MockSyncEngine] Stopping sync...');
    this.syncState.status = 'idle';
    this.notifyListeners();
  }

  async syncGroupData(groupId: string): Promise<void> {
    console.log('[MockSyncEngine] Syncing group data:', groupId);
    
    this.syncState.status = 'syncing';
    this.syncState.pendingOperations = 5;
    this.notifyListeners();
    
    // Simulate syncing with progress updates
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.syncState.pendingOperations = 4 - i;
      this.notifyListeners();
    }
    
    this.syncState.status = 'synced';
    this.syncState.lastSync = Date.now();
    this.notifyListeners();
  }

  async simulateConflict(): Promise<void> {
    const conflict: SyncConflict = {
      id: `conflict-${Date.now()}`,
      type: 'expense',
      entityId: '22222222-2222-2222-2222-222222222221',
      localVersion: {
        title: 'Grocery Shopping at Migros',
        amount: 85.50,
        version: 2,
        last_modified: new Date().toISOString()
      },
      remoteVersion: {
        title: 'Grocery Shopping at Coop',
        amount: 82.75,
        version: 2,
        last_modified: new Date(Date.now() - 1000).toISOString()
      },
      conflictFields: ['title', 'amount'],
      timestamp: Date.now()
    };
    
    this.syncState.conflicts.push(conflict);
    this.syncState.status = 'conflict';
    this.notifyListeners();
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    console.log('[MockSyncEngine] Resolving conflict:', conflictId, 'with:', resolution);
    
    const conflictIndex = this.syncState.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex >= 0) {
      this.syncState.conflicts[conflictIndex].resolution = resolution;
      this.syncState.conflicts.splice(conflictIndex, 1);
      
      if (this.syncState.conflicts.length === 0) {
        this.syncState.status = 'synced';
      }
      
      this.notifyListeners();
    }
  }

  async createGuestUser(name?: string): Promise<GuestUser> {
    const guestUser: GuestUser = {
      temp_id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Guest User',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      created_at: new Date().toISOString()
    };
    
    console.log('[MockSyncEngine] Created guest user:', guestUser);
    return guestUser;
  }

  async upgradeGuestUser(tempId: string, userId: string, email: string): Promise<boolean> {
    console.log('[MockSyncEngine] Upgrading guest user:', tempId, 'to:', userId);
    // In real implementation, this would call the database function
    return true;
  }

  onStateChange(callback: (state: SyncState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async destroy(): Promise<void> {
    console.log('[MockSyncEngine] Destroying...');
    this.listeners = [];
    this.operations = [];
    this.syncState = {
      status: 'idle',
      lastSync: null,
      conflicts: [],
      peers: [],
      pendingOperations: 0
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncState));
  }
}
