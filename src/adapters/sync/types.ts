// Core sync engine types for conflict detection and resolution
export interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error' | 'offline';
  lastSync: number | null;
  conflicts: ConflictData[];
  peers: PeerConnection[];
  pendingOperations: number;
}

// Unified conflict type - using ConflictData as the primary interface
export interface ConflictData<T = any> {
  id: string;
  type?: 'expense' | 'group' | 'user';
  entityId?: string;
  localVersion: T & SyncMetadata;
  remoteVersion: T & SyncMetadata;
  conflictType: 'concurrent_edit' | 'version_mismatch' | 'deletion_conflict';
  conflictFields?: string[];
  timestamp?: number;
  resolution?: 'local' | 'remote' | 'merge';
}

// Keep SyncConflict as an alias for backward compatibility
export type SyncConflict = ConflictData;

export interface PeerConnection {
  id: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastSeen: number;
  syncProgress?: number;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  entityId: string;
  data: any;
  timestamp: number;
  userId: string;
}

export interface GuestUser {
  temp_id: string;
  name?: string;
  email?: string;
  expires_at: string;
  created_at: string;
}

export interface ExpenseConflict {
  id: string;
  local: {
    version: number;
    last_modified: string;
    modified_by: string;
    data: any;
  };
  remote: {
    version: number;
    last_modified: string;
    modified_by: string;
    data: any;
  };
}

export interface SyncMetadata {
  version: number;
  timestamp: number;
  nodeId: string;
  checksum: string;
}

export interface SyncEvent<T = any> {
  type: 'data_updated' | 'conflict_detected' | 'sync_complete' | 'peer_connected' | 'peer_disconnected';
  data?: T;
  metadata?: SyncMetadata;
  conflicts?: ConflictData[];
  peerId?: string;
}

export interface PeerInfo {
  id: string;
  status: 'online' | 'offline';
  lastSeen: number;
  syncProgress?: number;
}

export type ConflictResolutionStrategy = 'last_write_wins' | 'reject_remote' | 'merge';
