
export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'error' | 'offline';

export interface SyncMetadata {
  version: number;
  timestamp: number;
  nodeId: string;
  checksum: string;
}

export interface ConflictData<T = any> {
  id: string;
  localVersion: T & SyncMetadata;
  remoteVersion: T & SyncMetadata;
  conflictType: 'concurrent_edit' | 'delete_update' | 'version_mismatch';
  resolvedAt?: number;
}

export interface SyncEvent<T = any> {
  type: 'sync_start' | 'sync_complete' | 'conflict_detected' | 'data_updated' | 'peer_connected' | 'peer_disconnected';
  data?: T;
  metadata?: SyncMetadata;
  peerId?: string;
  conflicts?: ConflictData[];
}

export interface PeerInfo {
  id: string;
  lastSeen: number;
  status: 'online' | 'offline';
  syncVersion: number;
}

export interface SyncState {
  status: SyncStatus;
  lastSync: number;
  conflicts: ConflictData[];
  peers: PeerInfo[];
  pendingOperations: number;
}

export type ConflictResolutionStrategy = 'last_write_wins' | 'manual' | 'merge' | 'reject_remote';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  metadata: SyncMetadata;
}
