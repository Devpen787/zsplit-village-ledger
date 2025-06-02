
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { GroupMember } from '@/types/supabase';

export const useGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    
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
    
    setLoading(true);
    try {
      console.log("Fetching members for group:", groupId);
      
      // Try the direct query first
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
        console.error("Direct query failed, trying edge function:", membersError);
        
        // Fallback to edge function if RLS blocks us
        try {
          const { data: user } = await supabase.auth.getUser();
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-group-data', {
            body: { groupId, userId: user.user?.id }
          });
          
          if (edgeError) throw edgeError;
          
          // Since the edge function doesn't return members yet, we'll show an empty state
          console.log("Edge function response:", edgeData);
          setMembers([]);
          toast.info("Member list temporarily unavailable due to database permissions");
        } catch (edgeErr) {
          console.error("Edge function also failed:", edgeErr);
          toast.error(`Error loading group members: ${membersError.message}`);
          setMembers([]);
        }
        return;
      }
      
      console.log("Group members data:", membersData);
      
      // Transform the data to match our interface
      const transformedMembers = (membersData || []).map(member => ({
        ...member,
        user: member.users
      }));
      
      setMembers(transformedMembers);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error(`Error loading group members: ${error.message}`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return { members, fetchMembers, loading };
};
