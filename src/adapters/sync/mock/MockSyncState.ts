
import { SyncState } from '../types';

export class MockSyncState {
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    conflicts: [],
    peers: [],
    pendingOperations: 0
  };

  getState(): SyncState {
    return { ...this.state };
  }

  updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
  }

  persistState(): void {
    try {
      localStorage.setItem('mock-sync-engine-state', JSON.stringify(this.state));
    } catch (error) {
      console.warn('[MockSyncState] Failed to persist state:', error);
    }
  }

  loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('mock-sync-engine-state');
      if (stored) {
        const parsedState = JSON.parse(stored);
        this.state = {
          status: parsedState.status || 'idle',
          lastSync: parsedState.lastSync || null,
          conflicts: parsedState.conflicts || [],
          peers: parsedState.peers || [],
          pendingOperations: parsedState.pendingOperations || 0
        };
      }
    } catch (error) {
      console.warn('[MockSyncState] Failed to load persisted state:', error);
    }
  }

  reset(): void {
    this.state = {
      status: 'idle',
      lastSync: null,
      conflicts: [],
      peers: [],
      pendingOperations: 0
    };
  }
}
