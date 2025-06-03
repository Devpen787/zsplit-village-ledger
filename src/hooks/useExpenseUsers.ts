
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';

type User = {
  id: string;
  name: string | null;
  email: string;
};

export const useExpenseUsers = (groupId?: string | null) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      console.log("Fetching users for expense selection, groupId:", groupId);
      
      if (groupId) {
        // Fetch group members for group expenses
        console.log("Fetching group members for group:", groupId);
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            users:user_id (
              id,
              name,
              email
            )
          `)
          .eq('group_id', groupId);

        if (membersError) {
          console.error("Error fetching group members:", membersError);
          setError(membersError.message);
          
          // Fallback to showing just the current user
          setUsers([{
            id: user.id,
            name: user.name || null,
            email: user.email
          }]);
          
          toast.error("Could not load group members. Only showing yourself for now.");
          return;
        }
        
        if (membersData && membersData.length > 0) {
          // Transform the data to match our User type
          const transformedUsers = membersData.map(member => ({
            id: member.users?.id || member.user_id,
            name: member.users?.name || null,
            email: member.users?.email || ''
          })).filter(user => user.email); // Filter out any invalid users
          
          console.log("Transformed group member users:", transformedUsers);
          setUsers(transformedUsers);
        } else {
          console.log("No group members found, showing current user only");
          setUsers([{
            id: user.id,
            name: user.name || null,
            email: user.email
          }]);
        }
      } else {
        // Fetch current user for non-group expenses
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', user.id)
          .single();

        if (!currentUserError && currentUserData) {
          setUsers([currentUserData]);
        } else {
          // Fallback to auth user data
          setUsers([{
            id: user.id,
            name: user.name || null,
            email: user.email
          }]);
        }
      }
    } catch (err: any) {
      console.error("Unexpected error fetching users:", err);
      setError(err.message || 'Failed to fetch users');
      
      // Always show current user as fallback
      if (user) {
        setUsers([{
          id: user.id,
          name: user.name || null,
          email: user.email
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, groupId]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [user, fetchUsers]);

  return { 
    users, 
    loading, 
    error,
    expenseUsers: users,
    isLoading: loading
  };
};
