
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { GroupMember } from '@/types/supabase';

export const useGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (!groupId) return;
    
    fetchMembers();
    
    const membersChannel = supabase
      .channel(`group-${groupId}-members-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
        () => fetchMembers()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(membersChannel);
    };
  }, [groupId]);

  const fetchMembers = async () => {
    if (!groupId) return;
    
    try {
      console.log("Fetching members for group:", groupId);
      
      const { data: membersData, error: membersError } = await (supabase
        .from('group_members') as any)
        .select(`
          id,
          group_id,
          user_id,
          role,
          users:user_id (
            id,
            name,
            email,
            wallet_address
          )
        `)
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("Error fetching members:", membersError);
        throw membersError;
      }
      
      console.log("Group members data:", membersData);
      setMembers(membersData || []);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
    }
  };

  return { members, fetchMembers };
};
