
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    display_name?: string;
  };
}

export const useGroupMembers = (groupId?: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        setMembers([]);
        return;
      }

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, display_name')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
        }

        const enrichedMembers = membersData.map(member => ({
          ...member,
          user: usersData?.find(user => user.id === member.user_id)
        }));

        setMembers(enrichedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  return { members, fetchMembers, loading };
};
