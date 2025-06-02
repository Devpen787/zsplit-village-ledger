
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
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasRecursionError(false);

    try {
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      console.log("Fetching users for expense selection, groupId:", groupId);
      
      let data;
      let supabaseError;

      if (groupId) {
        // Fetch group members for group expenses - try direct query first
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

        supabaseError = membersError;
        
        if (membersData && !membersError) {
          // Transform the data to match our User type
          data = membersData.map(member => ({
            id: member.users?.id || member.user_id,
            name: member.users?.name || null,
            email: member.users?.email || ''
          })).filter(user => user.email); // Filter out any invalid users
        } else {
          console.log("Direct query failed, trying edge function approach");
          
          // If RLS blocks us, try to get the current user at least
          const { data: currentUserData, error: currentUserError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', user.id)
            .single();
            
          if (currentUserError) {
            console.error("Could not fetch current user:", currentUserError);
            // Fallback to using auth user data
            data = [{
              id: user.id,
              name: user.name || null,
              email: user.email
            }];
          } else {
            data = [currentUserData];
          }
          
          toast.info("Limited user selection available due to permissions. Only showing yourself for now.");
        }
      } else {
        // Fetch current user for non-group expenses
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', user.id)
          .single();

        supabaseError = currentUserError;
        
        if (!currentUserError) {
          data = [currentUserData];
        } else {
          // Fallback to auth user data
          data = [{
            id: user.id,
            name: user.name || null,
            email: user.email
          }];
        }
      }

      if (supabaseError && supabaseError.message?.includes('infinite recursion')) {
        setHasRecursionError(true);
        setError("Database policy configuration issue");
        
        // Create mock data with just the current user for UI to show something
        if (user) {
          setUsers([{
            id: user.id,
            name: user.name,
            email: user.email
          }]);
        }
        
        toast.error("A database error occurred. This is likely due to a policy configuration issue.", {
          duration: 5000,
        });
      } else if (supabaseError && !data) {
        console.error("Error fetching users:", supabaseError);
        setError(supabaseError.message);
      } else {
        console.log("Users data received:", data);
        setUsers(data || []);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching users:", err);
      setError(err.message || 'Failed to fetch users');
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

  // For backward compatibility with ExpenseDetail.tsx
  return { 
    users, 
    loading, 
    error,
    expenseUsers: users,
    isLoading: loading,
    hasRecursionError
  };
};
