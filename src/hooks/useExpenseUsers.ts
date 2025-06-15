
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExpenseUser {
  id: string;
  name?: string;
  email: string;
  display_name?: string;
}

export const useExpenseUsers = (groupId?: string | null) => {
  const [users, setUsers] = useState<ExpenseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (groupId) {
          // Fetch group members
          const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', groupId);

          if (membersError) {
            throw membersError;
          }

          const userIds = membersData?.map(m => m.user_id) || [];
          
          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, name, email, display_name')
              .in('id', userIds);

            if (usersError) {
              throw usersError;
            }

            setUsers(usersData || []);
          } else {
            setUsers([]);
          }
        } else {
          // Fetch all users
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name, email, display_name');

          if (usersError) {
            throw usersError;
          }

          setUsers(usersData || []);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [groupId]);

  return { users, loading, error, isLoading: loading };
};
