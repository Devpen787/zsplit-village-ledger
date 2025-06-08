
import { StorageAdapter } from './StorageAdapter';
import { LocalStorageManager } from './local-storage/LocalStorageManager';
import { LocalStorageAuthAdapter } from './local-storage/AuthAdapter';
import { LocalStorageUserAdapter } from './local-storage/UserAdapter';
import { LocalStorageGroupAdapter } from './local-storage/GroupAdapter';
import { LocalStorageExpenseAdapter } from './local-storage/ExpenseAdapter';
import { LocalStoragePotAdapter } from './local-storage/PotAdapter';
import { LocalStorageInvitationAdapter } from './local-storage/InvitationAdapter';
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

export class LocalStorageAdapter implements StorageAdapter {
  private storageManager: LocalStorageManager;
  private authAdapter: LocalStorageAuthAdapter;
  private userAdapter: LocalStorageUserAdapter;
  private groupAdapter: LocalStorageGroupAdapter;
  private expenseAdapter: LocalStorageExpenseAdapter;
  private potAdapter: LocalStoragePotAdapter;
  private invitationAdapter: LocalStorageInvitationAdapter;

  constructor() {
    this.storageManager = new LocalStorageManager();
    this.authAdapter = new LocalStorageAuthAdapter(this.storageManager);
    this.userAdapter = new LocalStorageUserAdapter(this.storageManager);
    this.groupAdapter = new LocalStorageGroupAdapter(this.storageManager);
    this.expenseAdapter = new LocalStorageExpenseAdapter(this.storageManager);
    this.potAdapter = new LocalStoragePotAdapter(this.storageManager);
    this.invitationAdapter = new LocalStorageInvitationAdapter(this.storageManager);
  }

  // Authentication methods
  async getCurrentUser(): Promise<AuthUser | null> {
    return this.authAdapter.getCurrentUser();
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.authAdapter.getCurrentSession();
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    return this.authAdapter.signIn(email, password);
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    return this.authAdapter.signUp(email, password);
  }

  async signOut(): Promise<void> {
    return this.authAdapter.signOut();
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return this.authAdapter.onAuthStateChange(callback);
  }

  // User methods
  async getUsers(groupId?: string): Promise<User[]> {
    return this.userAdapter.getUsers(groupId);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userAdapter.getUserById(userId);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    return this.userAdapter.updateUser(userId, data);
  }

  // Group methods
  async getGroups(userId: string): Promise<Group[]> {
    return this.groupAdapter.getGroups(userId);
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    return this.groupAdapter.getGroupById(groupId);
  }

  async createGroup(data: Omit<Group, 'id' | 'created_at'>): Promise<Group> {
    return this.groupAdapter.createGroup(data);
  }

  async updateGroup(groupId: string, data: Partial<Group>): Promise<void> {
    return this.groupAdapter.updateGroup(groupId, data);
  }

  async deleteGroup(groupId: string): Promise<void> {
    return this.groupAdapter.deleteGroup(groupId);
  }

  // Group Member methods
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return this.groupAdapter.getGroupMembers(groupId);
  }

  async addGroupMember(groupId: string, userId: string, role?: string): Promise<GroupMember> {
    return this.groupAdapter.addGroupMember(groupId, userId, role);
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    return this.groupAdapter.removeGroupMember(groupId, userId);
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    return this.groupAdapter.updateMemberRole(groupId, userId, role);
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    return this.groupAdapter.isGroupMember(groupId, userId);
  }

  async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    return this.groupAdapter.isGroupAdmin(groupId, userId);
  }

  // Expense methods
  async getExpenses(groupId?: string, limit?: number): Promise<Expense[]> {
    return this.expenseAdapter.getExpenses(groupId, limit);
  }

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    return this.expenseAdapter.getExpenseById(expenseId);
  }

  async createExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
    return this.expenseAdapter.createExpense(data);
  }

  async updateExpense(expenseId: string, data: Partial<Expense>): Promise<void> {
    return this.expenseAdapter.updateExpense(expenseId, data);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    return this.expenseAdapter.deleteExpense(expenseId);
  }

  // Balance methods
  async calculateBalances(userId?: string): Promise<Balance[]> {
    return this.expenseAdapter.calculateBalances(userId);
  }

  // Pot Activity methods
  async getPotActivities(groupId: string): Promise<PotActivity[]> {
    return this.potAdapter.getPotActivities(groupId);
  }

  async createPotActivity(data: Omit<PotActivity, 'id' | 'created_at'>): Promise<PotActivity> {
    return this.potAdapter.createPotActivity(data);
  }

  async updatePotActivity(activityId: string, data: Partial<PotActivity>): Promise<void> {
    return this.potAdapter.updatePotActivity(activityId, data);
  }

  // Invitation methods
  async getInvitations(userId?: string): Promise<Invitation[]> {
    return this.invitationAdapter.getInvitations(userId);
  }

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    return this.invitationAdapter.createInvitation(groupId, email, invitedBy);
  }

  async updateInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    return this.invitationAdapter.updateInvitation(invitationId, status);
  }

  // Edge Functions (not implemented for localStorage)
  async invokeEdgeFunction(functionName: string, body: any): Promise<{ data: any; error: Error | null }> {
    return { data: null, error: new Error('Edge functions not supported in LocalStorage adapter') };
  }

  // Real-time subscriptions (not implemented for localStorage)
  subscribeToChanges(table: string, callback: (payload: any) => void, filter?: string): () => void {
    return () => {};
  }

  // Data management methods specific to LocalStorage
  exportGroupData(groupId: string): string {
    return this.storageManager.exportGroupData(groupId);
  }

  importGroupData(jsonData: string): void {
    return this.storageManager.importGroupData(jsonData);
  }
}
