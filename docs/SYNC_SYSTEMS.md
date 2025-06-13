
# Sync Engine & Guest User Systems

This document provides a comprehensive guide for developers working with the sync engine and guest user management systems.

## Table of Contents
- [Sync Engine Overview](#sync-engine-overview)
- [Testing Sync Behavior](#testing-sync-behavior)
- [Conflict Management](#conflict-management)
- [React Components & Hooks](#react-components--hooks)
- [Guest User Management](#guest-user-management)
- [Development Tools](#development-tools)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Sync Engine Overview

The sync engine provides real-time data synchronization capabilities for collaborative expense sharing. It's built with a clean interface that supports both mock (development) and real (production) implementations.

### Architecture

```
SyncEngine Interface
├── MockSyncEngine (development)
├── Real sync adapters (future)
└── SyncEngineAdapter (wrapper)
```

### Core Concepts

- **Nodes**: Individual users/devices participating in sync
- **Groups**: Collections of users sharing data
- **Operations**: Create, update, delete actions on data
- **Conflicts**: When multiple nodes modify the same data simultaneously
- **Metadata**: Version info, timestamps, checksums for conflict detection

### Key Features

- Automatic conflict detection using version vectors
- Multiple resolution strategies (last-write-wins, manual resolution)
- Peer-to-peer connectivity simulation
- Persistent state across browser sessions
- Real-time event notifications

## Testing Sync Behavior

### Multi-Tab Testing

The MockSyncEngine uses localStorage for persistence, making it easy to test sync behavior:

1. **Open multiple tabs** of your application
2. **Log in as different users** in each tab
3. **Join the same group** from multiple tabs
4. **Make changes** (create expenses, update group data) and observe sync

```typescript
// Example: Testing sync in multiple tabs
// Tab 1: User Alice creates expense
await syncEngine.initialize('alice-id', 'group-123');
await syncEngine.syncGroupData('group-123');

// Tab 2: User Bob sees the update
await syncEngine.initialize('bob-id', 'group-123');
// Changes will be automatically synced
```

### localStorage Persistence

The mock engine persists state across browser sessions:

```javascript
// Inspect sync state in browser console
console.log(localStorage.getItem('mock-sync-engine-state'));
console.log(localStorage.getItem('mock-sync-operations'));

// Clear sync state for testing
localStorage.removeItem('mock-sync-engine-state');
localStorage.removeItem('mock-sync-operations');
```

### Testing Scenarios

1. **Normal Sync Flow**
   - Create data in one tab
   - Verify appearance in other tabs
   - Check state transitions (idle → syncing → synced)

2. **Offline/Online Behavior**
   - Disconnect network
   - Make changes offline
   - Reconnect and verify sync resumption

3. **Peer Connection Testing**
   - Monitor peer connection status
   - Test peer discovery and connectivity

## Conflict Management

### Simulating Conflicts

Use the Sync DevTools to create realistic conflict scenarios:

```typescript
// Navigate to Tools → Sync Engine → Simulate Conflict
// This creates a mock expense conflict with different values
const conflict = {
  id: 'conflict-123',
  type: 'expense',
  entityId: 'expense-456',
  localVersion: {
    title: 'Grocery Shopping at Migros',
    amount: 85.50,
    version: 2,
    timestamp: Date.now(),
    nodeId: 'local',
    checksum: 'local-checksum'
  },
  remoteVersion: {
    title: 'Grocery Shopping at Coop', 
    amount: 82.75,
    version: 2,
    timestamp: Date.now() - 1000,
    nodeId: 'remote',
    checksum: 'remote-checksum'
  },
  conflictType: 'concurrent_edit',
  conflictFields: ['title', 'amount']
};
```

### Resolution Strategies

1. **Last Write Wins**: Choose the version with the latest timestamp
2. **Reject Remote**: Keep the local version
3. **Manual Resolution**: User chooses which version to keep

### Testing Conflict Resolution

```typescript
// Example: Programmatic conflict resolution
const conflicts = await syncEngine.getConflicts();
const conflict = conflicts[0];

// Resolve in favor of local version
await syncEngine.resolveConflict(conflict, 'reject_remote');

// Resolve in favor of remote version  
await syncEngine.resolveConflict(conflict, 'last_write_wins');
```

## React Components & Hooks

### useSyncEngine Hook

The main hook for sync functionality:

```typescript
import { useSyncEngine } from '@/hooks/useSyncEngine';

function MyComponent() {
  const {
    isInitialized,    // boolean: Is sync engine ready?
    syncState,        // SyncState: Current sync status
    startSync,        // () => Promise<void>: Begin sync
    stopSync,         // () => Promise<void>: Stop sync
    syncGroupData,    // (groupId?) => Promise<void>: Sync specific group
    resolveConflict   // (id, resolution) => Promise<void>: Resolve conflicts
  } = useSyncEngine('group-id-optional');

  // Example usage
  if (!isInitialized) return <div>Initializing sync...</div>;
  
  return (
    <div>
      <SyncStatusIndicator 
        status={syncState?.status || 'idle'}
        lastSync={syncState?.lastSync}
        conflictCount={syncState?.conflicts?.length || 0}
      />
      <button onClick={startSync}>Start Sync</button>
    </div>
  );
}
```

### SyncStatusIndicator Component

Visual status indicator for sync state:

```typescript
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';

<SyncStatusIndicator
  status="synced"           // 'idle' | 'syncing' | 'synced' | 'conflict' | 'error' | 'offline'
  lastSync={Date.now()}     // number: timestamp of last sync
  conflictCount={0}         // number: count of unresolved conflicts
  className="custom-class"  // string: additional CSS classes
/>
```

Status badge variations:
- **Synced** (green): All data is up-to-date
- **Syncing** (blue, animated): Sync in progress
- **Conflict** (orange): Manual resolution needed
- **Error** (red): Sync failure
- **Offline** (gray): No connection
- **Idle** (gray): No recent activity

### SyncDashboard Component

Full-featured sync management interface:

```typescript
import { SyncDashboard } from '@/components/sync/SyncDashboard';

<SyncDashboard groupId="optional-group-id" />
```

Features:
- Real-time sync status
- Peer connection monitoring
- Conflict resolution interface
- Sync controls (start/stop/force sync)
- Statistics and metrics

## Guest User Management

### Creating Guest Users

```typescript
import { MockSyncEngine } from '@/adapters/sync/MockSyncEngine';

const syncEngine = new MockSyncEngine();

// Create a guest user
const guestUser = await syncEngine.createGuestUser('Guest Name');
console.log(guestUser);
// {
//   temp_id: 'guest-1734567890-abc123def',
//   name: 'Guest Name',
//   expires_at: '2024-12-20T10:30:00.000Z', // 24 hours from creation
//   created_at: '2024-12-19T10:30:00.000Z'
// }
```

### Guest User Lifecycle

1. **Creation**: Guest users have 24-hour expiration
2. **Participation**: Can join groups and participate in expenses
3. **Upgrade**: Convert to full user account before expiration
4. **Expiration**: Automatic cleanup after 24 hours

### Upgrading Guest Users

```typescript
// Upgrade guest to full user
const success = await syncEngine.upgradeGuestUser(
  guestUser.temp_id,
  'new-user-id',
  'user@example.com'
);

if (success) {
  console.log('Guest successfully upgraded to full user');
}
```

### Guest User Management Component

```typescript
import { GuestUserManager } from '@/components/tools/GuestUserManager';

// In Tools page or admin interface
<GuestUserManager />
```

Features:
- Create new guest users
- View active guest users with expiration times
- Upgrade guests to full users
- Copy guest IDs for sharing

## Development Tools

### Sync DevTools

Access via: **Tools → Sync Engine**

Features:
- **Sync Status**: Real-time sync state monitoring
- **Peer Connections**: View connected users
- **Conflict Simulation**: Create test conflicts
- **Manual Controls**: Start/stop sync, force group sync
- **Statistics**: Sync metrics and performance data

### Guest User DevTools

Access via: **Tools → Guest Users**

Features:
- **Create Guests**: Generate test guest users
- **Manage Active Guests**: View and manage existing guests
- **Upgrade Flow**: Test guest-to-user conversion
- **Expiration Tracking**: Monitor guest user lifecycles

### Console Debugging

Enable debug mode for verbose logging:

```typescript
// Enable in browser console
localStorage.setItem('sync-debug', 'true');

// Check sync engine state
const state = await syncEngine.getSyncState();
console.log('Sync state:', state);

// Monitor sync events
syncEngine.on('data_updated', (event) => {
  console.log('Data updated:', event);
});

syncEngine.on('conflict_detected', (event) => {
  console.log('Conflict detected:', event.conflicts);
});
```

## Integration Examples

### Basic Group Sync

```typescript
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';

function GroupPage({ groupId }: { groupId: string }) {
  const { isInitialized, syncState, syncGroupData } = useSyncEngine(groupId);

  useEffect(() => {
    if (isInitialized) {
      // Auto-sync group data when component loads
      syncGroupData();
    }
  }, [isInitialized, syncGroupData]);

  return (
    <div>
      <header>
        <h1>Group Dashboard</h1>
        <SyncStatusIndicator 
          status={syncState?.status || 'idle'}
          lastSync={syncState?.lastSync}
          conflictCount={syncState?.conflicts?.length || 0}
        />
      </header>
      {/* Group content */}
    </div>
  );
}
```

### Conflict Resolution Flow

```typescript
import { ConflictResolutionDialog } from '@/components/sync/ConflictResolutionDialog';

function ConflictHandler() {
  const { syncState, resolveConflict } = useSyncEngine();
  const [selectedConflict, setSelectedConflict] = useState(null);

  const handleResolve = async (conflictId: string, resolution: 'local' | 'remote') => {
    await resolveConflict(conflictId, resolution);
    setSelectedConflict(null);
  };

  return (
    <>
      {syncState?.conflicts?.map(conflict => (
        <div key={conflict.id}>
          <p>Conflict in {conflict.type}: {conflict.conflictFields?.join(', ')}</p>
          <button onClick={() => setSelectedConflict(conflict)}>
            Resolve
          </button>
        </div>
      ))}
      
      <ConflictResolutionDialog
        conflict={selectedConflict}
        onResolve={handleResolve}
        onClose={() => setSelectedConflict(null)}
      />
    </>
  );
}
```

### Guest User Integration

```typescript
function InviteFlow() {
  const [guestUser, setGuestUser] = useState(null);
  const syncEngine = new MockSyncEngine();

  const createGuest = async () => {
    const guest = await syncEngine.createGuestUser('New Guest');
    setGuestUser(guest);
    
    // Guest can now participate in the group
    await syncEngine.initialize(guest.temp_id, groupId);
  };

  const upgradeGuest = async (email: string) => {
    if (guestUser) {
      const newUserId = `user-${Date.now()}`;
      const success = await syncEngine.upgradeGuestUser(
        guestUser.temp_id,
        newUserId,
        email
      );
      
      if (success) {
        // Redirect to account setup
        window.location.href = '/profile/complete';
      }
    }
  };

  return (
    <div>
      {!guestUser ? (
        <button onClick={createGuest}>Join as Guest</button>
      ) : (
        <div>
          <p>Joined as: {guestUser.name}</p>
          <p>Expires: {new Date(guestUser.expires_at).toLocaleString()}</p>
          <button onClick={() => upgradeGuest('user@example.com')}>
            Create Account
          </button>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Sync Not Starting**
   - Check if user is authenticated
   - Verify group membership
   - Look for console errors

2. **Conflicts Not Resolving**
   - Ensure conflict ID is correct
   - Check resolution strategy
   - Verify user permissions

3. **Guest User Issues**
   - Check expiration times
   - Verify guest ID format
   - Ensure upgrade flow completion

### Debug Commands

```javascript
// Browser console commands for debugging

// Check sync engine state
const state = await window.syncEngine?.getSyncState();

// Force sync
await window.syncEngine?.startSync();

// Clear all sync data
localStorage.removeItem('mock-sync-engine-state');
localStorage.removeItem('mock-sync-operations');
location.reload();

// Simulate network issues
window.syncEngine?.stopSync(); // Simulate disconnect
window.syncEngine?.startSync(); // Simulate reconnect
```

### Performance Monitoring

```typescript
// Track sync performance
const startTime = Date.now();
await syncEngine.syncGroupData(groupId);
const syncDuration = Date.now() - startTime;
console.log(`Sync completed in ${syncDuration}ms`);

// Monitor memory usage
console.log('Sync operations count:', operations.length);
console.log('Conflict count:', conflicts.length);
```

## Testing

### Unit Tests

```bash
# Run sync engine tests
npm test -- --testPathPattern=sync

# Run specific test suites
npm test useSyncEngine.test.tsx
npm test MockSyncEngine.test.ts
npm test SyncStatusIndicator.test.tsx
```

### Integration Tests

```bash
# Test multi-tab functionality
# 1. Open localhost:3000 in two tabs
# 2. Log in as different users
# 3. Join same group
# 4. Create expenses and verify sync

# Test guest user flow
# 1. Create guest user via Tools
# 2. Join group as guest
# 3. Participate in expenses
# 4. Upgrade to full user
```

### Manual QA Checklist

- [ ] Sync status indicator shows correct states
- [ ] Multi-tab sync works bidirectionally
- [ ] Conflicts can be created and resolved
- [ ] Guest users can be created and managed
- [ ] Guest upgrade flow completes successfully
- [ ] localStorage persistence works across sessions
- [ ] Peer connections display correctly
- [ ] Error handling works for edge cases

## API Reference

See the full TypeScript interfaces in:
- `src/adapters/sync/types.ts` - Core sync types
- `src/adapters/sync/SyncEngine.ts` - Main interface
- `src/adapters/sync/MockSyncEngine.ts` - Mock implementation

For additional help, check the inline documentation and TypeScript definitions in the codebase.
