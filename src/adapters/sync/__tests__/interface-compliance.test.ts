
import { MockSyncEngine } from '../MockSyncEngine';
import { SyncEngine } from '../SyncEngine';

describe('SyncEngine Interface Compliance', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    engine = new MockSyncEngine();
  });

  afterEach(async () => {
    await engine.destroy();
  });

  it('should implement all required SyncEngine methods', () => {
    // Core sync operations
    expect(typeof engine.initialize).toBe('function');
    expect(typeof engine.startSync).toBe('function');
    expect(typeof engine.stopSync).toBe('function');
    
    // Data synchronization
    expect(typeof engine.syncData).toBe('function');
    expect(typeof engine.pullChanges).toBe('function');
    expect(typeof engine.pushChanges).toBe('function');
    
    // Conflict management
    expect(typeof engine.detectConflicts).toBe('function');
    expect(typeof engine.resolveConflict).toBe('function');
    expect(typeof engine.getConflicts).toBe('function');
    
    // Peer management
    expect(typeof engine.getPeers).toBe('function');
    expect(typeof engine.connectToPeer).toBe('function');
    expect(typeof engine.disconnectFromPeer).toBe('function');
    
    // Version control
    expect(typeof engine.createVersion).toBe('function');
    expect(typeof engine.mergeVersions).toBe('function');
    
    // State management
    expect(typeof engine.getSyncState).toBe('function');
    
    // Event handling
    expect(typeof engine.on).toBe('function');
    expect(typeof engine.off).toBe('function');
    
    // Group operations
    expect(typeof engine.joinGroup).toBe('function');
    expect(typeof engine.leaveGroup).toBe('function');
    expect(typeof engine.syncGroup).toBe('function');
    
    // Cleanup
    expect(typeof engine.destroy).toBe('function');
  });

  it('should return correct types from async methods', async () => {
    await engine.initialize('test-node', 'test-group');
    
    // Check return types
    const syncState = await engine.getSyncState();
    expect(syncState).toHaveProperty('status');
    expect(syncState).toHaveProperty('lastSync');
    expect(syncState).toHaveProperty('conflicts');
    expect(syncState).toHaveProperty('peers');
    expect(syncState).toHaveProperty('pendingOperations');
    
    const conflicts = await engine.getConflicts();
    expect(Array.isArray(conflicts)).toBe(true);
    
    const peers = await engine.getPeers();
    expect(Array.isArray(peers)).toBe(true);
    
    const operations = await engine.pullChanges();
    expect(Array.isArray(operations)).toBe(true);
  });

  it('should handle method parameters correctly', async () => {
    await engine.initialize('test-node', 'test-group');
    
    // Test with various parameter combinations
    await expect(engine.syncData('test-table', [], {
      version: 1,
      timestamp: Date.now(),
      nodeId: 'test',
      checksum: 'test-checksum'
    })).resolves.not.toThrow();
    
    await expect(engine.pullChanges()).resolves.toBeDefined();
    await expect(engine.pullChanges(Date.now())).resolves.toBeDefined();
    
    await expect(engine.pushChanges([])).resolves.not.toThrow();
    
    await expect(engine.connectToPeer('test-peer')).resolves.not.toThrow();
    await expect(engine.disconnectFromPeer('test-peer')).resolves.not.toThrow();
  });

  it('should provide working event system', (done) => {
    let callbackCount = 0;
    
    const callback = () => {
      callbackCount++;
      if (callbackCount === 1) {
        unsubscribe();
        done();
      }
    };
    
    const unsubscribe = engine.on('data_updated', callback);
    
    // Trigger an event
    engine.initialize('test-node').then(() => {
      engine.startSync();
    });
  });
});
