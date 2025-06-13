
// Core sync engine types for conflict detection and resolution
export interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error' | 'offline';
  lastSync: number | null;
  conflicts: SyncConflict[];
  peers: PeerConnection[];
  pendingOperations: number;
}

export interface SyncConflict {
  id: string;
  type: 'expense' | 'group' | 'user';
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  conflictFields: string[];
  timestamp: number;
  resolution?: 'local' | 'remote' | 'merge';
}

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
