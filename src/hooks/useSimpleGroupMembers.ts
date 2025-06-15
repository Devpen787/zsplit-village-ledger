
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface SimpleGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    wallet_address?: string | null;
  } | null;
}

export const useSimpleGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<SimpleGroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("[SIMPLE GROUP MEMBERS] Fetching members for group:", groupId);
      
      // Simple query without RLS complications
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("[SIMPLE GROUP MEMBERS] Error fetching group members:", membersError);
        toast.error(`Error loading group members: ${membersError.message}`);
        setMembers([]);
        return;
      }
      
      console.log("[SIMPLE GROUP MEMBERS] Raw group members data:", membersData);
      
      if (!membersData || membersData.length === 0) {
        console.log("[SIMPLE GROUP MEMBERS] No members found for group");
        setMembers([]);
        return;
      }
      
      // Fetch user details for each member
      const userIds = membersData.map(member => member.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, wallet_address')
        .in('id', userIds);
        
      if (usersError) {
        console.error("[SIMPLE GROUP MEMBERS] Error fetching users:", usersError);
        // Still show members even if we can't get user details
      }
      
      // Combine member and user data
      const transformedMembers: SimpleGroupMember[] = membersData.map(member => {
        const userData = usersData?.find(user => user.id === member.user_id) || {
          id: member.user_id,
          name: `User ${member.user_id.slice(0, 8)}`,
          email: 'Unknown',
          wallet_address: null
        };
        
        return {
          id: member.id,
          group_id: member.group_id,
          user_id: member.user_id,
          role: member.role,
          created_at: member.created_at,
          user: userData
        };
      });
      
      console.log("[SIMPLE GROUP MEMBERS] Final transformed members:", transformedMembers);
      setMembers(transformedMembers);
    } catch (error: any) {
      console.error("[SIMPLE GROUP MEMBERS] Unexpected error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, fetchMembers, loading };
};
