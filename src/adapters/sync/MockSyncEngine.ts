
import { SyncState, ConflictData, SyncOperation, GuestUser, SyncMetadata, SyncEvent, PeerInfo, ConflictResolutionStrategy } from './types';
import { SyncEngine } from './SyncEngine';

export class MockSyncEngine implements SyncEngine {
  private syncState: SyncState = {
    status: 'idle',
    lastSync: null,
    conflicts: [],
    peers: [],
    pendingOperations: 0
  };

  private operations: SyncOperation[] = [];
  private listeners: Map<string, ((event: any) => void)[]> = new Map();
  private peers: Map<string, PeerInfo> = new Map();
  private conflicts: Map<string, ConflictData> = new Map();
  private isInitialized = false;
  private nodeId = '';

  async initialize(nodeId: string, groupId?: string): Promise<void> {
    console.log('[MockSyncEngine] Initializing for user:', nodeId, 'group:', groupId);
    
    this.nodeId = nodeId;
    this.isInitialized = true;
    
    this.loadPersistedState();
    
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
    
    this.persistState();
    this.notifyListeners();
  }

  async startSync(): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Starting sync...');
    this.syncState.status = 'syncing';
    this.notifyListeners();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.syncState.status = 'synced';
    this.syncState.lastSync = Date.now();
    this.persistState();
    this.notifyListeners();
    this.emit('sync_complete', {});
  }

  async stopSync(): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Stopping sync...');
    this.syncState.status = 'offline';
    this.persistState();
    this.notifyListeners();
  }

  async getSyncState(): Promise<SyncState> {
    return { ...this.syncState };
  }

  async getConflicts(): Promise<ConflictData[]> {
    return [...this.syncState.conflicts];
  }

  async syncGroupData(groupId: string): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Syncing group data:', groupId);
    
    this.syncState.status = 'syncing';
    this.syncState.pendingOperations = 5;
    this.notifyListeners();
    
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.syncState.pendingOperations = 4 - i;
      this.notifyListeners();
    }
    
    this.syncState.status = 'synced';
    this.syncState.lastSync = Date.now();
    this.persistState();
    this.notifyListeners();
  }

  async syncData<T>(table: string, data: T[], metadata: SyncMetadata): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Syncing data for table:', table);
    
    this.emit('data_updated', {
      type: 'data_updated',
      data,
      metadata
    });
  }

  async pullChanges(since?: number): Promise<SyncOperation[]> {
    this.ensureInitialized();
    
    if (since) {
      return this.operations.filter(op => op.timestamp > since);
    }
    return [...this.operations];
  }

  async pushChanges(operations: SyncOperation[]): Promise<void> {
    this.ensureInitialized();
    this.operations.push(...operations);
    this.persistState();
  }

  detectConflicts<T>(localData: T & SyncMetadata, remoteData: T & SyncMetadata): ConflictData<T> | null {
    if (localData.version === remoteData.version && 
        localData.checksum !== remoteData.checksum &&
        Math.abs(localData.timestamp - remoteData.timestamp) < 1000) {
      
      return {
        id: `conflict-${Date.now()}`,
        localVersion: localData,
        remoteVersion: remoteData,
        conflictType: 'concurrent_edit'
      };
    }
    
    return null;
  }

  async resolveConflict<T>(conflict: ConflictData<T>, strategy: ConflictResolutionStrategy): Promise<T> {
    this.ensureInitialized();
    
    let resolved: T;
    
    switch (strategy) {
      case 'last_write_wins':
        resolved = conflict.remoteVersion.timestamp > conflict.localVersion.timestamp 
          ? conflict.remoteVersion : conflict.localVersion;
        break;
      case 'reject_remote':
        resolved = conflict.localVersion;
        break;
      case 'merge':
        resolved = this.mergeVersions(conflict.localVersion, conflict.remoteVersion);
        break;
      default:
        resolved = conflict.localVersion;
    }
    
    this.conflicts.delete(conflict.id);
    this.persistState();
    
    return resolved;
  }

  async getPeers(): Promise<PeerInfo[]> {
    this.ensureInitialized();
    return Array.from(this.peers.values());
  }

  async connectToPeer(peerId: string): Promise<void> {
    this.ensureInitialized();
    
    this.peers.set(peerId, {
      id: peerId,
      status: 'online',
      lastSeen: Date.now()
    });
    
    this.emit('peer_connected', { type: 'peer_connected', peerId });
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    this.ensureInitialized();
    
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.status = 'offline';
      this.peers.set(peerId, peer);
    }
    
    this.emit('peer_disconnected', { type: 'peer_disconnected', peerId });
  }

  createVersion<T>(data: T): T & SyncMetadata {
    return {
      ...data,
      version: 1,
      timestamp: Date.now(),
      nodeId: this.nodeId,
      checksum: Math.random().toString(36)
    };
  }

  mergeVersions<T>(local: T & SyncMetadata, remote: T & SyncMetadata): T & SyncMetadata {
    return {
      ...remote,
      version: Math.max(local.version, remote.version) + 1,
      timestamp: Date.now(),
      nodeId: this.nodeId,
      checksum: Math.random().toString(36)
    };
  }

  async joinGroup(groupId: string): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Joining group:', groupId);
  }

  async leaveGroup(groupId: string): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Leaving group:', groupId);
  }

  async syncGroup(groupId: string): Promise<void> {
    await this.syncGroupData(groupId);
  }

  on<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  off<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  async destroy(): Promise<void> {
    console.log('[MockSyncEngine] Destroying...');
    this.listeners.clear();
    this.operations = [];
    this.peers.clear();
    this.conflicts.clear();
    this.isInitialized = false;
    this.syncState = {
      status: 'idle',
      lastSync: null,
      conflicts: [],
      peers: [],
      pendingOperations: 0
    };
  }

  async simulateConflict(): Promise<void> {
    const conflict: ConflictData = {
      id: `conflict-${Date.now()}`,
      type: 'expense',
      entityId: '22222222-2222-2222-2222-222222222221',
      localVersion: {
        title: 'Grocery Shopping at Migros',
        amount: 85.50,
        version: 2,
        last_modified: new Date().toISOString(),
        timestamp: Date.now(),
        nodeId: this.nodeId,
        checksum: 'local-checksum'
      },
      remoteVersion: {
        title: 'Grocery Shopping at Coop',
        amount: 82.75,
        version: 2,
        last_modified: new Date(Date.now() - 1000).toISOString(),
        timestamp: Date.now() - 1000,
        nodeId: 'remote-node',
        checksum: 'remote-checksum'
      },
      conflictType: 'concurrent_edit',
      conflictFields: ['title', 'amount'],
      timestamp: Date.now()
    };
    
    this.syncState.conflicts.push(conflict);
    this.syncState.status = 'conflict';
    this.persistState();
    this.notifyListeners();
  }

  async createGuestUser(name?: string): Promise<GuestUser> {
    const guestUser: GuestUser = {
      temp_id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Guest User',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    console.log('[MockSyncEngine] Created guest user:', guestUser);
    return guestUser;
  }

  async upgradeGuestUser(tempId: string, userId: string, email: string): Promise<boolean> {
    console.log('[MockSyncEngine] Upgrading guest user:', tempId, 'to:', userId);
    return true;
  }

  onStateChange(callback: (state: SyncState) => void): () => void {
    return this.on('data_updated' as any, callback as any);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('SyncEngine not initialized. Call initialize() first.');
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  private notifyListeners(): void {
    this.emit('data_updated', { type: 'data_updated', data: this.syncState });
  }

  private persistState(): void {
    try {
      localStorage.setItem('mock-sync-engine-data', JSON.stringify({
        ...this.syncState,
        operations: this.operations
      }));
    } catch (error) {
      console.warn('[MockSyncEngine] Failed to persist state:', error);
    }
  }

  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('mock-sync-engine-data');
      if (stored) {
        const parsedState = JSON.parse(stored);
        this.syncState = {
          status: parsedState.status || 'idle',
          lastSync: parsedState.lastSync || null,
          conflicts: parsedState.conflicts || [],
          peers: parsedState.peers || [],
          pendingOperations: parsedState.pendingOperations || 0
        };
        this.operations = parsedState.operations || [];
      }
    } catch (error) {
      console.warn('[MockSyncEngine] Failed to load persisted state:', error);
    }
  }
}
