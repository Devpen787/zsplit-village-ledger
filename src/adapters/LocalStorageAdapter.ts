
import { StorageAdapter } from './StorageAdapter';
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

interface LocalStorageData {
  users: User[];
  groups: Group[];
  groupMembers: GroupMember[];
  expenses: Expense[];
  potActivities: PotActivity[];
  invitations: Invitation[];
  currentUser: AuthUser | null;
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEY = 'expense-tracker-data';
  private currentUser: AuthUser | null = null;

  constructor() {
    this.initializeStorage();
    this.loadCurrentUser();
  }

  private initializeStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const initialData: LocalStorageData = {
        users: [],
        groups: [],
        groupMembers: [],
        expenses: [],
        potActivities: [],
        invitations: [],
        currentUser: null
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  private getData(): LocalStorageData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultData();
  }

  private saveData(data: LocalStorageData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private getDefaultData(): LocalStorageData {
    return {
      users: [],
      groups: [],
      groupMembers: [],
      expenses: [],
      potActivities: [],
      invitations: [],
      currentUser: null
    };
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private loadCurrentUser(): void {
    const data = this.getData();
    this.currentUser = data.currentUser;
  }

  // Authentication
  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (!this.currentUser) return null;
    
    return {
      user: this.currentUser,
      access_token: 'local-token',
      expires_at: Date.now() + 3600000 // 1 hour from now
    };
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const data = this.getData();
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return { user: null, error: new Error('User not found') };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    this.currentUser = authUser;
    data.currentUser = authUser;
    this.saveData(data);

    return { user: authUser, error: null };
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const data = this.getData();
    const existingUser = data.users.find(u => u.email === email);
    
    if (existingUser) {
      return { user: null, error: new Error('User already exists') };
    }

    const newUser: User = {
      id: this.generateId(),
      email,
      name: email.split('@')[0],
      wallet_address: null
    };

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    };

    data.users.push(newUser);
    this.currentUser = authUser;
    data.currentUser = authUser;
    this.saveData(data);

    return { user: authUser, error: null };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    const data = this.getData();
    data.currentUser = null;
    this.saveData(data);
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    // For localStorage, we'll just call the callback with current user
    callback(this.currentUser);
    return () => {}; // No cleanup needed
  }

  // Users
  async getUsers(groupId?: string): Promise<User[]> {
    const data = this.getData();
    
    if (!groupId) return data.users;
    
    const groupMemberIds = data.groupMembers
      .filter(gm => gm.group_id === groupId)
      .map(gm => gm.user_id);
    
    return data.users.filter(user => groupMemberIds.includes(user.id));
  }

  async getUserById(userId: string): Promise<User | null> {
    const data = this.getData();
    return data.users.find(user => user.id === userId) || null;
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<void> {
    const data = this.getData();
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updateData };
      this.saveData(data);
    }
  }

  // Groups
  async getGroups(userId: string): Promise<Group[]> {
    const data = this.getData();
    const userGroupIds = data.groupMembers
      .filter(gm => gm.user_id === userId)
      .map(gm => gm.group_id);
    
    return data.groups.filter(group => userGroupIds.includes(group.id));
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const data = this.getData();
    return data.groups.find(group => group.id === groupId) || null;
  }

  async createGroup(groupData: Omit<Group, 'id' | 'created_at'>): Promise<Group> {
    const data = this.getData();
    const newGroup: Group = {
      ...groupData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    
    data.groups.push(newGroup);
    
    // Add creator as admin
    const membership: GroupMember = {
      id: this.generateId(),
      group_id: newGroup.id,
      user_id: groupData.created_by,
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    data.groupMembers.push(membership);
    this.saveData(data);
    
    return newGroup;
  }

  async updateGroup(groupId: string, updateData: Partial<Group>): Promise<void> {
    const data = this.getData();
    const groupIndex = data.groups.findIndex(group => group.id === groupId);
    
    if (groupIndex !== -1) {
      data.groups[groupIndex] = { ...data.groups[groupIndex], ...updateData };
      this.saveData(data);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const data = this.getData();
    
    // Remove group
    data.groups = data.groups.filter(group => group.id !== groupId);
    
    // Remove group members
    data.groupMembers = data.groupMembers.filter(gm => gm.group_id !== groupId);
    
    // Remove group expenses
    data.expenses = data.expenses.filter(expense => expense.group_id !== groupId);
    
    // Remove group pot activities
    data.potActivities = data.potActivities.filter(activity => activity.group_id !== groupId);
    
    // Remove group invitations
    data.invitations = data.invitations.filter(invitation => invitation.group_id !== groupId);
    
    this.saveData(data);
  }

  // Group Members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const data = this.getData();
    const members = data.groupMembers.filter(gm => gm.group_id === groupId);
    
    // Attach user data
    return members.map(member => ({
      ...member,
      user: data.users.find(user => user.id === member.user_id)
    }));
  }

  async addGroupMember(groupId: string, userId: string, role: string = 'member'): Promise<GroupMember> {
    const data = this.getData();
    const newMember: GroupMember = {
      id: this.generateId(),
      group_id: groupId,
      user_id: userId,
      role,
      created_at: new Date().toISOString()
    };
    
    data.groupMembers.push(newMember);
    this.saveData(data);
    
    return newMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    const data = this.getData();
    data.groupMembers = data.groupMembers.filter(
      gm => !(gm.group_id === groupId && gm.user_id === userId)
    );
    this.saveData(data);
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    const data = this.getData();
    const memberIndex = data.groupMembers.findIndex(
      gm => gm.group_id === groupId && gm.user_id === userId
    );
    
    if (memberIndex !== -1) {
      data.groupMembers[memberIndex].role = role;
      this.saveData(data);
    }
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const data = this.getData();
    return data.groupMembers.some(gm => gm.group_id === groupId && gm.user_id === userId);
  }

  async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    const data = this.getData();
    const member = data.groupMembers.find(gm => gm.group_id === groupId && gm.user_id === userId);
    return member?.role === 'admin';
  }

  // Expenses
  async getExpenses(groupId?: string, limit?: number): Promise<Expense[]> {
    const data = this.getData();
    let expenses = data.expenses;
    
    if (groupId) {
      expenses = expenses.filter(expense => expense.group_id === groupId);
    }
    
    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      expenses = expenses.slice(0, limit);
    }
    
    // Attach user data
    return expenses.map(expense => ({
      ...expense,
      paid_by_user: data.users.find(user => user.id === expense.paid_by)
    }));
  }

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    const data = this.getData();
    const expense = data.expenses.find(expense => expense.id === expenseId);
    
    if (!expense) return null;
    
    return {
      ...expense,
      paid_by_user: data.users.find(user => user.id === expense.paid_by)
    };
  }

  async createExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const data = this.getData();
    const newExpense: Expense = {
      ...expenseData,
      id: this.generateId()
    };
    
    data.expenses.push(newExpense);
    this.saveData(data);
    
    return newExpense;
  }

  async updateExpense(expenseId: string, updateData: Partial<Expense>): Promise<void> {
    const data = this.getData();
    const expenseIndex = data.expenses.findIndex(expense => expense.id === expenseId);
    
    if (expenseIndex !== -1) {
      data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...updateData };
      this.saveData(data);
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const data = this.getData();
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId);
    this.saveData(data);
  }

  // Balances
  async calculateBalances(userId?: string): Promise<Balance[]> {
    const data = this.getData();
    const userBalances = new Map<string, number>();
    
    // Calculate balances from expenses
    data.expenses.forEach(expense => {
      // Add amount to the person who paid
      const currentBalance = userBalances.get(expense.paid_by) || 0;
      userBalances.set(expense.paid_by, currentBalance + expense.amount);
    });
    
    // Convert to Balance array
    const balances: Balance[] = [];
    userBalances.forEach((amount, userId) => {
      const user = data.users.find(u => u.id === userId);
      if (user) {
        balances.push({
          user_id: userId,
          user_name: user.name,
          user_email: user.email,
          amount
        });
      }
    });
    
    return balances;
  }

  // Group Pot Activities
  async getPotActivities(groupId: string): Promise<PotActivity[]> {
    const data = this.getData();
    const activities = data.potActivities
      .filter(activity => activity.group_id === groupId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Attach user data
    return activities.map(activity => ({
      ...activity,
      user: data.users.find(user => user.id === activity.user_id)
    }));
  }

  async createPotActivity(activityData: Omit<PotActivity, 'id' | 'created_at'>): Promise<PotActivity> {
    const data = this.getData();
    const newActivity: PotActivity = {
      ...activityData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    
    data.potActivities.push(newActivity);
    this.saveData(data);
    
    return newActivity;
  }

  async updatePotActivity(activityId: string, updateData: Partial<PotActivity>): Promise<void> {
    const data = this.getData();
    const activityIndex = data.potActivities.findIndex(activity => activity.id === activityId);
    
    if (activityIndex !== -1) {
      data.potActivities[activityIndex] = { ...data.potActivities[activityIndex], ...updateData };
      this.saveData(data);
    }
  }

  // Invitations
  async getInvitations(userId?: string): Promise<Invitation[]> {
    const data = this.getData();
    let invitations = data.invitations.filter(inv => inv.status === 'pending');
    
    if (userId) {
      const userEmail = data.users.find(u => u.id === userId)?.email;
      if (userEmail) {
        invitations = invitations.filter(inv => inv.email === userEmail);
      }
    }
    
    // Attach group data
    return invitations.map(invitation => ({
      ...invitation,
      groups: data.groups.find(group => group.id === invitation.group_id)
    }));
  }

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    const data = this.getData();
    const newInvitation: Invitation = {
      id: this.generateId(),
      group_id: groupId,
      email: email.toLowerCase(),
      invited_by: invitedBy,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    data.invitations.push(newInvitation);
    this.saveData(data);
    
    return newInvitation;
  }

  async updateInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    const data = this.getData();
    const invitationIndex = data.invitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex !== -1) {
      data.invitations[invitationIndex].status = status;
      this.saveData(data);
    }
  }

  // Edge Functions (mock implementation)
  async invokeEdgeFunction(functionName: string, body: any): Promise<{ data: any; error: Error | null }> {
    console.log(`Mock edge function call: ${functionName}`, body);
    return { data: null, error: null };
  }

  // Real-time subscriptions (mock implementation)
  subscribeToChanges(table: string, callback: (payload: any) => void, filter?: string): () => void {
    console.log(`Mock subscription to ${table} with filter: ${filter}`);
    return () => {};
  }

  // Export/Import functionality
  exportGroupData(groupId: string): string {
    const data = this.getData();
    
    const groupData = {
      group: data.groups.find(g => g.id === groupId),
      members: data.groupMembers.filter(gm => gm.group_id === groupId),
      expenses: data.expenses.filter(e => e.group_id === groupId),
      potActivities: data.potActivities.filter(pa => pa.group_id === groupId),
      invitations: data.invitations.filter(i => i.group_id === groupId),
      users: data.users.filter(u => 
        data.groupMembers.some(gm => gm.group_id === groupId && gm.user_id === u.id)
      ),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(groupData, null, 2);
  }

  importGroupData(jsonData: string): void {
    try {
      const importData = JSON.parse(jsonData);
      
      // Basic validation
      if (!importData.group || !importData.version) {
        throw new Error('Invalid export format');
      }
      
      const data = this.getData();
      const groupId = importData.group.id;
      
      // Remove existing group data
      data.groups = data.groups.filter(g => g.id !== groupId);
      data.groupMembers = data.groupMembers.filter(gm => gm.group_id !== groupId);
      data.expenses = data.expenses.filter(e => e.group_id !== groupId);
      data.potActivities = data.potActivities.filter(pa => pa.group_id !== groupId);
      data.invitations = data.invitations.filter(i => i.group_id !== groupId);
      
      // Import new data
      if (importData.group) data.groups.push(importData.group);
      if (importData.members) data.groupMembers.push(...importData.members);
      if (importData.expenses) data.expenses.push(...importData.expenses);
      if (importData.potActivities) data.potActivities.push(...importData.potActivities);
      if (importData.invitations) data.invitations.push(...importData.invitations);
      
      // Merge users (avoid duplicates)
      if (importData.users) {
        importData.users.forEach((importUser: User) => {
          const existingUserIndex = data.users.findIndex(u => u.id === importUser.id);
          if (existingUserIndex === -1) {
            data.users.push(importUser);
          } else {
            data.users[existingUserIndex] = importUser;
          }
        });
      }
      
      this.saveData(data);
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
