
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { User } from '@/types/auth';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { useExpenses } from '@/hooks/useExpenses';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupInvites } from '@/hooks/useGroupInvites';
import { useGroupAdminStatus } from '@/hooks/useGroupAdminStatus';

export const useGroupDetails = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the extracted hooks
  const { members } = useGroupMembers(id);
  const { inviteMember } = useGroupInvites(id);
  const { isAdmin } = useGroupAdminStatus(id, user);
  
  // Get group pulse data for metrics
  const { 
    potBalance = 0, 
    pendingPayoutsCount = 0, 
    connectedWalletsCount = 0 
  } = id ? useGroupPulse(id) : { potBalance: 0, pendingPayoutsCount: 0, connectedWalletsCount: 0 };
  
  // Get expenses data for metrics
  const { expenses } = id ? useExpenses(undefined, id) : { expenses: [] };
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum: number, expense) => sum + Number(expense.amount || 0), 0);
  
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
    // Add these properties to fix the errors
    potBalance,
    totalExpenses,
    pendingPayoutsCount,
    connectedWalletsCount
  };
};
