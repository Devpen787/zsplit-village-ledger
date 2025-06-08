
import { 
  User, 
  Group, 
  GroupMember, 
  Expense, 
  Balance, 
  PotActivity, 
  Invitation,
  AuthUser,
  AuthSession 
} from './types';

export interface StorageAdapter {
  // Authentication
  getCurrentUser(): Promise<AuthUser | null>;
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }>;
  signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;

  // Users
  getUsers(groupId?: string): Promise<User[]>;
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, data: Partial<User>): Promise<void>;

  // Groups
  getGroups(userId: string): Promise<Group[]>;
  getGroupById(groupId: string): Promise<Group | null>;
  createGroup(data: Omit<Group, 'id' | 'created_at'>): Promise<Group>;
  updateGroup(groupId: string, data: Partial<Group>): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;

  // Group Members
  getGroupMembers(groupId: string): Promise<GroupMember[]>;
  addGroupMember(groupId: string, userId: string, role?: string): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  updateMemberRole(groupId: string, userId: string, role: string): Promise<void>;
  isGroupMember(groupId: string, userId: string): Promise<boolean>;
  isGroupAdmin(groupId: string, userId: string): Promise<boolean>;

  // Expenses
  getExpenses(groupId?: string, limit?: number): Promise<Expense[]>;
  getExpenseById(expenseId: string): Promise<Expense | null>;
  createExpense(data: Omit<Expense, 'id'>): Promise<Expense>;
  updateExpense(expenseId: string, data: Partial<Expense>): Promise<void>;
  deleteExpense(expenseId: string): Promise<void>;

  // Balances
  calculateBalances(userId?: string): Promise<Balance[]>;

  // Group Pot Activities
  getPotActivities(groupId: string): Promise<PotActivity[]>;
  createPotActivity(data: Omit<PotActivity, 'id' | 'created_at'>): Promise<PotActivity>;
  updatePotActivity(activityId: string, data: Partial<PotActivity>): Promise<void>;

  // Invitations
  getInvitations(userId?: string): Promise<Invitation[]>;
  createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation>;
  updateInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void>;

  // Edge Functions
  invokeEdgeFunction(functionName: string, body: any): Promise<{ data: any; error: Error | null }>;

  // Real-time subscriptions
  subscribeToChanges(table: string, callback: (payload: any) => void, filter?: string): () => void;
}
