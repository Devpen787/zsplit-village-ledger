
import { supabase } from '@/integrations/supabase/client';
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

export class SupabaseAdapter implements StorageAdapter {
  // Authentication
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || null
    };
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || null
      },
      access_token: session.access_token,
      expires_at: session.expires_at
    };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || null
      } : null,
      error: error || null
    };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || null
      } : null,
      error: error || null
    };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || null
      } : null;
      
      callback(user);
    });
    
    return () => subscription.unsubscribe();
  }

  // Users
  async getUsers(groupId?: string): Promise<User[]> {
    let query = supabase.from('users').select('*');

    if (groupId) {
      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (groupMembers && groupMembers.length > 0) {
        const userIds = groupMembers.map(member => member.user_id);
        query = query.in('id', userIds);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Groups
  async getGroups(userId: string): Promise<Group[]> {
    const { data: groupIds, error: functionError } = await supabase
      .rpc('user_groups', { user_id_param: userId });
      
    if (functionError) throw functionError;
    
    if (!groupIds || groupIds.length === 0) return [];
    
    const groupsData = await Promise.all(
      groupIds.map(async (groupId: string) => {
        const { data, error } = await supabase.functions.invoke('get-group-data', {
          body: { groupId, userId }
        });
        
        if (error) throw error;
        return data.data;
      })
    );
    
    return groupsData.filter(group => group !== null);
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async createGroup(data: Omit<Group, 'id' | 'created_at'>): Promise<Group> {
    const { data: result, error } = await supabase.functions.invoke('create-group', {
      body: data
    });
    
    if (error) throw error;
    return result;
  }

  async updateGroup(groupId: string, data: Partial<Group>): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .update(data)
      .eq('id', groupId);
    
    if (error) throw error;
  }

  async deleteGroup(groupId: string): Promise<void> {
    // Delete expenses
    await supabase.from('expenses').delete().eq('group_id', groupId);
    
    // Delete members
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);
    
    if (membersError) throw membersError;
    
    // Delete invitations
    await supabase.from('invitations').delete().eq('group_id', groupId);
    
    // Delete group
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (groupError) throw groupError;
  }

  // Group Members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        user_id,
        role,
        created_at,
        user:users!user_id (
          id,
          name,
          email,
          wallet_address
        )
      `)
      .eq('group_id', groupId);
    
    if (error) throw error;
    return data || [];
  }

  async addGroupMember(groupId: string, userId: string, role: string = 'member'): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const { data } = await supabase.rpc('is_group_member', { 
      group_id_param: groupId, 
      user_id_param: userId 
    });
    
    return !!data;
  }

  async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    const { data } = await supabase.rpc('is_group_admin', { 
      group_id_param: groupId, 
      user_id_param: userId 
    });
    
    return !!data;
  }

  // Expenses
  async getExpenses(groupId?: string, limit?: number): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select(`
        id,
        title,
        amount,
        currency,
        date,
        paid_by,
        group_id,
        users:paid_by (
          name,
          email
        )
      `)
      .order('date', { ascending: false });
      
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((expense: any) => ({
      id: expense.id,
      title: expense.title || 'Unnamed Expense',
      amount: expense.amount || 0,
      currency: expense.currency || 'CHF',
      date: expense.date || new Date().toISOString(),
      paid_by: expense.paid_by,
      group_id: expense.group_id,
      paid_by_user: expense.users
    }));
  }

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async createExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
    const { data: result, error } = await supabase.functions.invoke('create-expense', {
      body: data
    });
    
    if (error) throw error;
    return result.data;
  }

  async updateExpense(expenseId: string, data: Partial<Expense>): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', expenseId);
    
    if (error) throw error;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    
    if (error) throw error;
  }

  // Balances
  async calculateBalances(): Promise<Balance[]> {
    const { data, error } = await supabase.rpc('calculate_balances');
    if (error) throw error;
    return data || [];
  }

  // Group Pot Activities
  async getPotActivities(groupId: string): Promise<PotActivity[]> {
    const { data, error } = await supabase
      .from('group_pot_activity')
      .select(`
        *,
        user:users!user_id (
          name
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Cast the database response to our typed interface
    return (data || []).map((activity: any) => ({
      id: activity.id,
      group_id: activity.group_id,
      user_id: activity.user_id,
      type: activity.type as 'contribution' | 'payout',
      amount: activity.amount,
      status: activity.status as 'pending' | 'approved' | 'complete' | 'rejected',
      note: activity.note,
      created_at: activity.created_at,
      user: activity.user
    }));
  }

  async createPotActivity(data: Omit<PotActivity, 'id' | 'created_at'>): Promise<PotActivity> {
    const { data: result, error } = await supabase
      .from('group_pot_activity')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    
    // Cast the result to our typed interface
    return {
      id: result.id,
      group_id: result.group_id,
      user_id: result.user_id,
      type: result.type as 'contribution' | 'payout',
      amount: result.amount,
      status: result.status as 'pending' | 'approved' | 'complete' | 'rejected',
      note: result.note,
      created_at: result.created_at
    };
  }

  async updatePotActivity(activityId: string, data: Partial<PotActivity>): Promise<void> {
    const { error } = await supabase
      .from('group_pot_activity')
      .update(data)
      .eq('id', activityId);
    
    if (error) throw error;
  }

  // Invitations
  async getInvitations(): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        groups (
          name,
          icon
        )
      `)
      .eq('status', 'pending');
    
    if (error) throw error;
    
    // Cast the database response to our typed interface
    return (data || []).map((invitation: any) => ({
      id: invitation.id,
      group_id: invitation.group_id,
      email: invitation.email,
      invited_by: invitation.invited_by,
      status: invitation.status as 'pending' | 'accepted' | 'declined',
      created_at: invitation.created_at,
      groups: invitation.groups
    }));
  }

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        group_id: groupId,
        email: email.toLowerCase(),
        invited_by: invitedBy,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Cast the result to our typed interface
    return {
      id: data.id,
      group_id: data.group_id,
      email: data.email,
      invited_by: data.invited_by,
      status: data.status as 'pending' | 'accepted' | 'declined',
      created_at: data.created_at
    };
  }

  async updateInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', invitationId);
    
    if (error) throw error;
  }

  // Edge Functions
  async invokeEdgeFunction(functionName: string, body: any): Promise<{ data: any; error: Error | null }> {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    return { data, error };
  }

  // Real-time subscriptions
  subscribeToChanges(table: string, callback: (payload: any) => void, filter?: string): () => void {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        },
        callback
      )
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }
}
