
import { SyncEngine } from './SyncEngine';
import { SyncMetadata, ConflictData, SyncEvent, PeerInfo, SyncState, ConflictResolutionStrategy, SyncOperation, SyncStatus } from './types';

export class MockSyncEngine implements SyncEngine {
  private nodeId: string = '';
  private groupId?: string;
  private syncState: SyncState;
  private eventListeners: Map<string, ((event: SyncEvent) => void)[]> = new Map();
  private storageKey = 'mock-sync-engine-data';
  private operationsKey = 'mock-sync-operations';
  private peersKey = 'mock-sync-peers';
  private isInitialized = false;
  private syncInterval?: number;

  constructor() {
    this.syncState = {
      status: 'offline',
      lastSync: 0,
      conflicts: [],
      peers: [],
      pendingOperations: 0
    };
  }

  async initialize(nodeId: string, groupId?: string): Promise<void> {
    this.nodeId = nodeId;
    this.groupId = groupId;
    this.isInitialized = true;
    
    // Load existing state from localStorage
    await this.loadState();
    
    this.syncState.status = 'synced';
    this.emit('sync_start', {});
    
    console.log(`[MOCK SYNC] Initialized sync engine for node ${nodeId}${groupId ? ` in group ${groupId}` : ''}`);
  }

  async startSync(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SyncEngine not initialized');
    }
    
    this.syncState.status = 'syncing';
    
    // Start periodic sync (every 5 seconds in mock)
    this.syncInterval = window.setInterval(async () => {
      await this.performPeriodicSync();
    }, 5000);
    
    console.log('[MOCK SYNC] Sync started');
  }

  async stopSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    
    this.syncState.status = 'offline';
    console.log('[MOCK SYNC] Sync stopped');
  }

  async syncData<T>(table: string, data: T[], metadata: SyncMetadata): Promise<void> {
    const operations: SyncOperation[] = data.map((item: any) => ({
      id: this.generateId(),
      type: item.id ? 'update' : 'create',
      table,
      recordId: item.id || this.generateId(),
      data: item,
      metadata
    }));
    
    await this.pushChanges(operations);
    this.emit('data_updated', { data, metadata });
  }

  async pullChanges(since?: number): Promise<SyncOperation[]> {
    const operations = this.getStoredOperations();
    const sinceTimestamp = since || 0;
    
    return operations.filter(op => op.metadata.timestamp > sinceTimestamp);
  }

  async pushChanges(operations: SyncOperation[]): Promise<void> {
    const existingOps = this.getStoredOperations();
    const allOps = [...existingOps, ...operations];
    
    localStorage.setItem(this.operationsKey, JSON.stringify(allOps));
    this.syncState.pendingOperations = allOps.length;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`[MOCK SYNC] Pushed ${operations.length} operations`);
  }

  detectConflicts<T>(localData: T & SyncMetadata, remoteData: T & SyncMetadata): ConflictData<T> | null {
    // Simple conflict detection based on version and timestamp
    if (localData.version !== remoteData.version && 
        Math.abs(localData.timestamp - remoteData.timestamp) < 1000) {
      return {
        id: this.generateId(),
        localVersion: localData,
        remoteVersion: remoteData,
        conflictType: 'concurrent_edit'
      };
    }
    
    return null;
  }

  async resolveConflict<T>(conflict: ConflictData<T>, strategy: ConflictResolutionStrategy): Promise<T> {
    let resolved: T;
    
    switch (strategy) {
      case 'last_write_wins':
        resolved = conflict.localVersion.timestamp > conflict.remoteVersion.timestamp 
          ? conflict.localVersion 
          : conflict.remoteVersion;
        break;
      case 'merge':
        resolved = this.mergeVersions(conflict.localVersion, conflict.remoteVersion);
        break;
      case 'reject_remote':
        resolved = conflict.localVersion;
        break;
      default:
        resolved = conflict.localVersion;
    }
    
    // Mark conflict as resolved
    const conflictIndex = this.syncState.conflicts.findIndex(c => c.id === conflict.id);
    if (conflictIndex !== -1) {
      this.syncState.conflicts[conflictIndex].resolvedAt = Date.now();
    }
    
    return resolved;
  }

  async getConflicts(): Promise<ConflictData[]> {
    return this.syncState.conflicts.filter(c => !c.resolvedAt);
  }

  async getPeers(): Promise<PeerInfo[]> {
    return this.syncState.peers;
  }

  async connectToPeer(peerId: string): Promise<void> {
    const existingPeer = this.syncState.peers.find(p => p.id === peerId);
    if (!existingPeer) {
      this.syncState.peers.push({
        id: peerId,
        lastSeen: Date.now(),
        status: 'online',
        syncVersion: 1
      });
      
      this.emit('peer_connected', { peerId });
      console.log(`[MOCK SYNC] Connected to peer ${peerId}`);
    }
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    const peerIndex = this.syncState.peers.findIndex(p => p.id === peerId);
    if (peerIndex !== -1) {
      this.syncState.peers[peerIndex].status = 'offline';
      this.emit('peer_disconnected', { peerId });
      console.log(`[MOCK SYNC] Disconnected from peer ${peerId}`);
    }
  }

  createVersion<T>(data: T): T & SyncMetadata {
    return {
      ...data,
      version: 1,
      timestamp: Date.now(),
      nodeId: this.nodeId,
      checksum: this.generateChecksum(data)
    };
  }

  mergeVersions<T>(local: T & SyncMetadata, remote: T & SyncMetadata): T & SyncMetadata {
    // Simple merge strategy - combine properties, prefer newer values
    const merged = { ...local };
    
    Object.keys(remote).forEach(key => {
      if (key !== 'version' && key !== 'timestamp' && key !== 'nodeId' && key !== 'checksum') {
        // Prefer remote if it's newer
        if (remote.timestamp > local.timestamp) {
          (merged as any)[key] = (remote as any)[key];
        }
      }
    });
    
    return {
      ...merged,
      version: Math.max(local.version, remote.version) + 1,
      timestamp: Date.now(),
      nodeId: this.nodeId,
      checksum: this.generateChecksum(merged)
    };
  }

  async getSyncState(): Promise<SyncState> {
    return { ...this.syncState };
  }

  on<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback as any);
    
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback as any);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  off<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback as any);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  async joinGroup(groupId: string): Promise<void> {
    this.groupId = groupId;
    console.log(`[MOCK SYNC] Joined group ${groupId}`);
  }

  async leaveGroup(groupId: string): Promise<void> {
    if (this.groupId === groupId) {
      this.groupId = undefined;
    }
    console.log(`[MOCK SYNC] Left group ${groupId}`);
  }

  async syncGroup(groupId: string): Promise<void> {
    if (this.groupId !== groupId) {
      await this.joinGroup(groupId);
    }
    
    // Simulate group sync
    await new Promise(resolve => setTimeout(resolve, 200));
    this.syncState.lastSync = Date.now();
    
    this.emit('sync_complete', {});
    console.log(`[MOCK SYNC] Synced group ${groupId}`);
  }

  async destroy(): Promise<void> {
    await this.stopSync();
    this.eventListeners.clear();
    this.syncState = {
      status: 'offline',
      lastSync: 0,
      conflicts: [],
      peers: [],
      pendingOperations: 0
    };
    
    console.log('[MOCK SYNC] Sync engine destroyed');
  }

  private async loadState(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.syncState = { ...this.syncState, ...data };
      }
    } catch (error) {
      console.warn('[MOCK SYNC] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.syncState));
    } catch (error) {
      console.warn('[MOCK SYNC] Failed to save state:', error);
    }
  }

  private getStoredOperations(): SyncOperation[] {
    try {
      const stored = localStorage.getItem(this.operationsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async performPeriodicSync(): Promise<void> {
    if (this.syncState.status === 'syncing') {
      return; // Already syncing
    }
    
    const oldStatus = this.syncState.status;
    this.syncState.status = 'syncing';
    
    try {
      // Simulate sync operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.syncState.lastSync = Date.now();
      this.syncState.status = 'synced';
      
      if (oldStatus !== 'synced') {
        this.emit('sync_complete', {});
      }
    } catch (error) {
      this.syncState.status = 'error';
      console.error('[MOCK SYNC] Periodic sync failed:', error);
    }
    
    await this.saveState();
  }

  private emit<T>(type: SyncEvent<T>['type'], data: Partial<SyncEvent<T>>): void {
    const event: SyncEvent<T> = {
      type,
      ...data
    };
    
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  private generateId(): string {
    return `${this.nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChecksum(data: any): string {
    // Simple checksum implementation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
