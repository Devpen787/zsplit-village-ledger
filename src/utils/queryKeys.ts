
export const QueryKeys = {
  // User queries
  user: (userId: string) => ['user', userId],
  userProfile: (userId: string) => ['userProfile', userId],
  
  // Group queries
  groups: () => ['groups'],
  group: (groupId: string) => ['group', groupId],
  groupMembers: (groupId: string) => ['groupMembers', groupId],
  groupDetails: (groupId: string) => ['groupDetails', groupId],
  
  // Expense queries
  expenses: (groupId?: string) => groupId ? ['expenses', groupId] : ['expenses'],
  expense: (expenseId: string) => ['expense', expenseId],
  expenseUsers: (groupId?: string) => ['expenseUsers', groupId],
  
  // Balance queries
  balances: (groupId?: string) => groupId ? ['balances', groupId] : ['balances'],
  settlements: (groupId?: string) => groupId ? ['settlements', groupId] : ['settlements'],
  
  // Group Pot queries
  potActivities: (groupId: string) => ['potActivities', groupId],
  potBalance: (groupId: string) => ['potBalance', groupId],
  
  // Group Pulse queries
  pulseActivities: (groupId: string) => ['pulseActivities', groupId],
  pulseStats: (groupId: string) => ['pulseStats', groupId],
  crossGroupStats: () => ['crossGroupStats'],
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (operation: string, entityId?: string) => {
  switch (operation) {
    case 'expense-created':
    case 'expense-updated':
    case 'expense-deleted':
      return [
        QueryKeys.expenses(entityId),
        QueryKeys.balances(entityId),
        QueryKeys.pulseStats(entityId || ''),
      ];
    
    case 'group-updated':
      return [
        QueryKeys.group(entityId || ''),
        QueryKeys.groups(),
        QueryKeys.groupDetails(entityId || ''),
      ];
    
    case 'pot-activity':
      return [
        QueryKeys.potActivities(entityId || ''),
        QueryKeys.potBalance(entityId || ''),
        QueryKeys.pulseStats(entityId || ''),
      ];
    
    default:
      return [];
  }
};
