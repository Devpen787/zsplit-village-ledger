
import { SyncOperation, SyncMetadata } from '../types';

export class MockSyncOperations {
  private operations: SyncOperation[] = [];
  private nodeId: string = '';

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  async pullChanges(since?: number): Promise<SyncOperation[]> {
    if (since) {
      return this.operations.filter(op => op.timestamp > since);
    }
    return [...this.operations];
  }

  async pushChanges(operations: SyncOperation[]): Promise<void> {
    this.operations.push(...operations);
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

  persistOperations(): void {
    try {
      localStorage.setItem('mock-sync-operations', JSON.stringify(this.operations));
    } catch (error) {
      console.warn('[MockSyncOperations] Failed to persist operations:', error);
    }
  }

  loadPersistedOperations(): void {
    try {
      const stored = localStorage.getItem('mock-sync-operations');
      if (stored) {
        this.operations = JSON.parse(stored) || [];
      }
    } catch (error) {
      console.warn('[MockSyncOperations] Failed to load persisted operations:', error);
    }
  }

  clear(): void {
    this.operations = [];
  }
}
