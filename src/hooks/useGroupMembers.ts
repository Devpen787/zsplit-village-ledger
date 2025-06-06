
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { GroupMember } from '@/types/supabase';

export const useGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("[GROUP MEMBERS] Fetching members for group:", groupId);
      
      // First, get all group members
      const { data: groupMembersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, group_id, user_id, role, created_at')
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("[GROUP MEMBERS] Error fetching group members:", membersError);
        toast.error(`Error loading group members: ${membersError.message}`);
        setMembers([]);
        return;
      }
      
      console.log("[GROUP MEMBERS] Raw group members data:", groupMembersData);
      
      if (!groupMembersData || groupMembersData.length === 0) {
        console.log("[GROUP MEMBERS] No members found for group");
        setMembers([]);
        return;
      }
      
      // Get user IDs
      const userIds = groupMembersData.map(member => member.user_id);
      console.log("[GROUP MEMBERS] Fetching user details for IDs:", userIds);
      
      // Fetch user details separately
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, wallet_address')
        .in('id', userIds);
        
      if (usersError) {
        console.error("[GROUP MEMBERS] Error fetching user details:", usersError);
        // Continue with members even if user details fail
      }
      
      console.log("[GROUP MEMBERS] User details data:", usersData);
      
      // Combine the data manually
      const transformedMembers: GroupMember[] = groupMembersData.map(member => {
        const userData = usersData?.find(user => user.id === member.user_id);
        
        return {
          id: member.id,
          group_id: member.group_id,
          user_id: member.user_id,
          role: member.role,
          created_at: member.created_at,
          user: userData || {
            id: member.user_id,
            name: `User ${member.user_id.slice(0, 8)}`,
            email: 'Unknown',
            wallet_address: null
          }
        };
      });
      
      console.log("[GROUP MEMBERS] Final transformed members:", transformedMembers);
      setMembers(transformedMembers);
    } catch (error: any) {
      console.error("[GROUP MEMBERS] Unexpected error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      console.log("[GROUP MEMBERS] No groupId provided");
      setLoading(false);
      return;
    }
    
    console.log("[GROUP MEMBERS] Setting up for group:", groupId);
    fetchMembers();
    
    const membersChannel = supabase
      .channel(`group-${groupId}-members-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
        (payload) => {
          console.log("[GROUP MEMBERS] Real-time update received:", payload);
          fetchMembers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log("[GROUP MEMBERS] User table update received:", payload);
          fetchMembers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(membersChannel);
    };
  }, [groupId, fetchMembers]);

  return { members, fetchMembers, loading };
};
