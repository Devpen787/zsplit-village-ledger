
import { SyncState, ConflictData, SyncOperation, GuestUser, SyncMetadata, SyncEvent, PeerInfo, ConflictResolutionStrategy } from './types';
import { SyncEngine } from './SyncEngine';
import { MockEventEmitter } from './mock/MockEventEmitter';
import { MockSyncState } from './mock/MockSyncState';
import { MockPeerManager } from './mock/MockPeerManager';
import { MockConflictManager } from './mock/MockConflictManager';
import { MockSyncOperations } from './mock/MockSyncOperations';

export class MockSyncEngine implements SyncEngine {
  private eventEmitter: MockEventEmitter;
  private syncState: MockSyncState;
  private peerManager: MockPeerManager;
  private conflictManager: MockConflictManager;
  private syncOperations: MockSyncOperations;
  private isInitialized = false;
  private nodeId = '';

  constructor() {
    this.eventEmitter = new MockEventEmitter();
    this.syncState = new MockSyncState();
    this.peerManager = new MockPeerManager(this.eventEmitter);
    this.conflictManager = new MockConflictManager();
    this.syncOperations = new MockSyncOperations('');
  }

  async initialize(nodeId: string, groupId?: string): Promise<void> {
    console.log('[MockSyncEngine] Initializing for user:', nodeId, 'group:', groupId);
    
    this.nodeId = nodeId;
    this.syncOperations = new MockSyncOperations(nodeId);
    this.isInitialized = true;
    
    this.syncState.loadPersistedState();
    this.syncOperations.loadPersistedOperations();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.syncState.updateState({
      status: 'synced',
      lastSync: Date.now(),
      peers: [
        { id: 'peer-1', status: 'connected', lastSeen: Date.now() },
        { id: 'peer-2', status: 'connected', lastSeen: Date.now() - 5000 }
      ]
    });
    
    this.persistState();
    this.notifyListeners();
  }

  async startSync(): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Starting sync...');
    this.syncState.updateState({ status: 'syncing' });
    this.notifyListeners();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.syncState.updateState({
      status: 'synced',
      lastSync: Date.now()
    });
    this.persistState();
    this.notifyListeners();
    this.eventEmitter.emit('sync_complete', {});
  }

  async stopSync(): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Stopping sync...');
    this.syncState.updateState({ status: 'offline' });
    this.persistState();
    this.notifyListeners();
  }

  async getSyncState(): Promise<SyncState> {
    return this.syncState.getState();
  }

  async getConflicts(): Promise<ConflictData[]> {
    const conflicts = await this.conflictManager.getConflicts();
    return conflicts;
  }

  async syncGroupData(groupId: string): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Syncing group data:', groupId);
    
    this.syncState.updateState({
      status: 'syncing',
      pendingOperations: 5
    });
    this.notifyListeners();
    
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.syncState.updateState({ pendingOperations: 4 - i });
      this.notifyListeners();
    }
    
    this.syncState.updateState({
      status: 'synced',
      lastSync: Date.now()
    });
    this.persistState();
    this.notifyListeners();
  }

  async syncData<T>(table: string, data: T[], metadata: SyncMetadata): Promise<void> {
    this.ensureInitialized();
    console.log('[MockSyncEngine] Syncing data for table:', table);
    
    this.eventEmitter.emit('data_updated', {
      type: 'data_updated',
      data,
      metadata
    });
  }

  async pullChanges(since?: number): Promise<SyncOperation[]> {
    this.ensureInitialized();
    return this.syncOperations.pullChanges(since);
  }

  async pushChanges(operations: SyncOperation[]): Promise<void> {
    this.ensureInitialized();
    await this.syncOperations.pushChanges(operations);
    this.persistState();
  }

  detectConflicts<T>(localData: T & SyncMetadata, remoteData: T & SyncMetadata): ConflictData<T> | null {
    return this.conflictManager.detectConflicts(localData, remoteData);
  }

  async resolveConflict<T>(conflict: ConflictData<T>, strategy: ConflictResolutionStrategy): Promise<T> {
    this.ensureInitialized();
    const resolved = await this.conflictManager.resolveConflict(conflict, strategy);
    this.persistState();
    return resolved;
  }

  async getPeers(): Promise<PeerInfo[]> {
    this.ensureInitialized();
    return this.peerManager.getPeers();
  }

  async connectToPeer(peerId: string): Promise<void> {
    this.ensureInitialized();
    await this.peerManager.connectToPeer(peerId);
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    this.ensureInitialized();
    await this.peerManager.disconnectFromPeer(peerId);
  }

  createVersion<T>(data: T): T & SyncMetadata {
    return this.syncOperations.createVersion(data);
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
    return this.eventEmitter.on(event, callback);
  }

  off<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): void {
    this.eventEmitter.off(event, callback);
  }

  async destroy(): Promise<void> {
    console.log('[MockSyncEngine] Destroying...');
    this.eventEmitter.clear();
    this.syncOperations.clear();
    this.peerManager.clear();
    this.conflictManager.clear();
    this.syncState.reset();
    this.isInitialized = false;
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
    
    this.conflictManager.addConflict(conflict);
    const currentState = this.syncState.getState();
    this.syncState.updateState({
      conflicts: [...currentState.conflicts, conflict],
      status: 'conflict'
    });
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
    return this.eventEmitter.on('data_updated' as any, callback as any);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('SyncEngine not initialized. Call initialize() first.');
    }
  }

  private notifyListeners(): void {
    this.eventEmitter.emit('data_updated', { type: 'data_updated', data: this.syncState.getState() });
  }

  private persistState(): void {
    this.syncState.persistState();
    this.syncOperations.persistOperations();
  }
}
