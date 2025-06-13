
import { SyncEngine } from './SyncEngine';
import { MockSyncEngine } from './MockSyncEngine';
import { StorageAdapter } from '../StorageAdapter';
import { SyncMetadata, SyncState, ConflictData } from './types';

export class SyncEngineAdapter {
  private syncEngine: SyncEngine;
  private storageAdapter: StorageAdapter;

  constructor(storageAdapter: StorageAdapter, syncEngine?: SyncEngine) {
    this.storageAdapter = storageAdapter;
    this.syncEngine = syncEngine || new MockSyncEngine();
  }

  async initialize(userId: string, groupId?: string): Promise<void> {
    await this.syncEngine.initialize(userId, groupId);
    
    // Set up event listeners for storage adapter integration
    this.syncEngine.on('data_updated', (event) => {
      console.log('[SYNC ADAPTER] Data updated:', event);
    });
    
    this.syncEngine.on('conflict_detected', (event) => {
      console.log('[SYNC ADAPTER] Conflict detected:', event.conflicts);
    });
    
    this.syncEngine.on('sync_complete', () => {
      console.log('[SYNC ADAPTER] Sync completed');
    });
  }

  async syncGroups(userId: string): Promise<void> {
    const groups = await this.storageAdapter.getGroups(userId);
    const metadata = this.createMetadata();
    
    await this.syncEngine.syncData('groups', groups, metadata);
  }

  async syncGroupData(groupId: string): Promise<void> {
    await this.syncEngine.syncGroup(groupId);
    
    // Sync all group-related data
    const [group, members, expenses, potActivities] = await Promise.all([
      this.storageAdapter.getGroupById(groupId),
      this.storageAdapter.getGroupMembers(groupId),
      this.storageAdapter.getExpenses(groupId),
      this.storageAdapter.getPotActivities(groupId)
    ]);
    
    const metadata = this.createMetadata();
    
    if (group) {
      await this.syncEngine.syncData('groups', [group], metadata);
    }
    
    await Promise.all([
      this.syncEngine.syncData('group_members', members, metadata),
      this.syncEngine.syncData('expenses', expenses, metadata),
      this.syncEngine.syncData('pot_activities', potActivities, metadata)
    ]);
  }

  async getSyncState(): Promise<SyncState> {
    return this.syncEngine.getSyncState();
  }

  async getConflicts(): Promise<ConflictData[]> {
    return this.syncEngine.getConflicts() as Promise<ConflictData[]>;
  }

  async resolveConflict(conflictId: string, strategy: 'local' | 'remote' | 'merge' = 'merge'): Promise<void> {
    const conflicts = await this.syncEngine.getConflicts() as ConflictData[];
    const conflict = conflicts.find(c => c.id === conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    const strategyMap = {
      'local': 'reject_remote' as const,
      'remote': 'last_write_wins' as const,
      'merge': 'merge' as const
    };
    
    await this.syncEngine.resolveConflict(conflict, strategyMap[strategy]);
  }

  async startSync(): Promise<void> {
    await this.syncEngine.startSync();
  }

  async stopSync(): Promise<void> {
    await this.syncEngine.stopSync();
  }

  async destroy(): Promise<void> {
    await this.syncEngine.destroy();
  }

  onSyncEvent<T>(event: string, callback: (data: T) => void): () => void {
    return this.syncEngine.on(event as any, callback as any);
  }

  private createMetadata(): SyncMetadata {
    return {
      version: 1,
      timestamp: Date.now(),
      nodeId: 'local',
      checksum: Math.random().toString(36)
    };
  }
}
