
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { GroupMember } from '@/types/supabase';

export const useGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [groupId]);

  const fetchMembers = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      console.log("[GROUP MEMBERS] Fetching members for group:", groupId);
      
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          group_id,
          user_id,
          role,
          created_at,
          users:user_id (
            id,
            name,
            email,
            wallet_address
          )
        `)
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("[GROUP MEMBERS] Error fetching group members:", membersError);
        toast.error(`Error loading group members: ${membersError.message}`);
        setMembers([]);
        return;
      }
      
      console.log("[GROUP MEMBERS] Raw members data:", membersData);
      
      // Transform the data to match our interface
      const transformedMembers = (membersData || []).map(member => ({
        ...member,
        user: member.users
      }));
      
      console.log("[GROUP MEMBERS] Transformed members:", transformedMembers);
      setMembers(transformedMembers);
    } catch (error: any) {
      console.error("[GROUP MEMBERS] Unexpected error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return { members, fetchMembers, loading };
};
