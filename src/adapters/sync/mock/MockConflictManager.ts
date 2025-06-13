
import { ConflictData, SyncMetadata, ConflictResolutionStrategy } from '../types';

export class MockConflictManager {
  private conflicts: Map<string, ConflictData> = new Map();

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
    
    return resolved;
  }

  async getConflicts(): Promise<ConflictData[]> {
    return Array.from(this.conflicts.values());
  }

  addConflict(conflict: ConflictData): void {
    this.conflicts.set(conflict.id, conflict);
  }

  private mergeVersions<T>(local: T & SyncMetadata, remote: T & SyncMetadata): T & SyncMetadata {
    return {
      ...remote,
      version: Math.max(local.version, remote.version) + 1,
      timestamp: Date.now(),
      nodeId: local.nodeId,
      checksum: Math.random().toString(36)
    };
  }

  clear(): void {
    this.conflicts.clear();
  }
}
