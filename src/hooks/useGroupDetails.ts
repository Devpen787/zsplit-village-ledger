
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { User } from '@/types/auth';
import { Expense } from '@/types/expenses';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupInvites } from '@/hooks/useGroupInvites';
import { useGroupAdminStatus } from '@/hooks/useGroupAdminStatus';
import { useExpenses } from '@/hooks/useExpenses';

export const useGroupDetails = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [potBalance, setPotBalance] = useState(0);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);
  const [connectedWalletsCount, setConnectedWalletsCount] = useState(0);
  
  // Use the extracted hooks
  const { members } = useGroupMembers(id);
  const { inviteMember } = useGroupInvites(id);
  const { isAdmin } = useGroupAdminStatus(id, user);
  
  // Get expenses data for metrics
  const { expenses } = id ? useExpenses(undefined, id) : { expenses: [] };
  
  // Calculate total expenses
  const totalExpenses = (expenses || []).reduce(
    (sum: number, expense: Expense) => sum + Number(expense.amount || 0),
    0
  );
  
  useEffect(() => {
    if (!id) return;
    
    fetchGroupDetails();
    
    const groupsChannel = supabase
      .channel(`group-${id}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${id}` },
        () => fetchGroupDetails()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(groupsChannel);
    };
  }, [id, user]);
  
  // Load pot metrics in a separate effect to avoid circular dependencies
  useEffect(() => {
    if (!id) return;
    
    const fetchPotMetrics = async () => {
      try {
        // Fetch pot balance and other metrics from group_pot_activity table
        const { data: activities, error } = await supabase
          .from('group_pot_activity')
          .select('*')
          .eq('group_id', id);
          
        if (error) throw error;
        
        // Calculate pot balance from activities
        let balance = 0;
        let pending = 0;
        
        if (activities) {
          // Calculate balance
          balance = activities.reduce((bal, activity) => {
            if (activity.type === 'contribution' && activity.status === 'complete') {
              return bal + Number(activity.amount || 0);
            } else if (activity.type === 'payout' && 
                      (activity.status === 'approved' || activity.status === 'complete')) {
              return bal - Number(activity.amount || 0);
            }
            return bal;
          }, 0);
          
          // Count pending payouts
          pending = activities.filter(
            activity => activity.type === 'payout' && activity.status === 'pending'
          ).length;
        }
        
        // Fetch wallet connection data
        const { data: groupMembers, error: membersError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', id);
          
        if (membersError) throw membersError;
        
        // Get all users with connected wallets
        const { data: connectedUsers, error: usersError } = await supabase
          .from('users')
          .select('id, wallet_address')
          .not('wallet_address', 'is', null);
          
        if (usersError) throw usersError;
        
        // Count members with connected wallets
        const connectedCount = groupMembers?.filter(member => 
          connectedUsers?.some(user => 
            user.id === member.user_id && user.wallet_address
          )
        ).length || 0;
        
        setPotBalance(balance);
        setPendingPayoutsCount(pending);
        setConnectedWalletsCount(connectedCount);
        
      } catch (error: any) {
        console.error("Error fetching pot metrics:", error);
      }
    };
    
    fetchPotMetrics();
  }, [id]);
  
  const fetchGroupDetails = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    try {
      console.log("Fetching group details for:", id);
      
      // Fetch group details
      const { data: groupData, error: groupError } = await (supabase
        .from('groups') as any)
        .select('*')
        .eq('id', id)
        .single();
        
      if (groupError) {
        console.error("Error fetching group:", groupError);
        throw groupError;
      }
      
      if (!groupData) {
        toast.error("Group not found");
        navigate('/');
        return;
      }
      
      console.log("Group data:", groupData);
      setGroup(groupData);
      
    } catch (error: any) {
      console.error("Error fetching group:", error);
      toast.error(`Error loading group: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for inviteMember to provide user ID
  const handleInviteMember = async (inviteEmail: string) => {
    if (!user) throw new Error("User not authenticated");
    return inviteMember(inviteEmail, user.id);
  };

  return {
    group,
    members,
    loading,
    isAdmin,
    inviteMember: handleInviteMember,
    refreshData: fetchGroupDetails,
    // Use the state values instead of calling useGroupPulse
    potBalance,
    totalExpenses,
    pendingPayoutsCount,
    connectedWalletsCount
  };
};
