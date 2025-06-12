
import { SyncMetadata, ConflictData, SyncEvent, PeerInfo, SyncState, ConflictResolutionStrategy, SyncOperation } from './types';

export interface SyncEngine {
  // Core sync operations
  initialize(nodeId: string, groupId?: string): Promise<void>;
  startSync(): Promise<void>;
  stopSync(): Promise<void>;
  
  // Data synchronization
  syncData<T>(table: string, data: T[], metadata: SyncMetadata): Promise<void>;
  pullChanges(since?: number): Promise<SyncOperation[]>;
  pushChanges(operations: SyncOperation[]): Promise<void>;
  
  // Conflict management
  detectConflicts<T>(localData: T & SyncMetadata, remoteData: T & SyncMetadata): ConflictData<T> | null;
  resolveConflict<T>(conflict: ConflictData<T>, strategy: ConflictResolutionStrategy): Promise<T>;
  getConflicts(): Promise<ConflictData[]>;
  
  // Peer management
  getPeers(): Promise<PeerInfo[]>;
  connectToPeer(peerId: string): Promise<void>;
  disconnectFromPeer(peerId: string): Promise<void>;
  
  // Version control
  createVersion<T>(data: T): T & SyncMetadata;
  mergeVersions<T>(local: T & SyncMetadata, remote: T & SyncMetadata): T & SyncMetadata;
  
  // State management
  getSyncState(): Promise<SyncState>;
  
  // Event handling
  on<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): () => void;
  off<T>(event: SyncEvent<T>['type'], callback: (event: SyncEvent<T>) => void): void;
  
  // Group-level operations
  joinGroup(groupId: string): Promise<void>;
  leaveGroup(groupId: string): Promise<void>;
  syncGroup(groupId: string): Promise<void>;
  
  // Cleanup
  destroy(): Promise<void>;
}
