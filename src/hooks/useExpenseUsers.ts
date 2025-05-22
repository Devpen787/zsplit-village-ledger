
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';

type User = {
  id: string;
  name: string | null;
  email: string;
};

export const useExpenseUsers = () => {
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

      console.log("Fetching users for expense selection");
      
      // Wrap the query in a timeout to ensure we don't trigger recursive RLS issues
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, name, email');

      if (supabaseError) {
        console.error("Error fetching users:", supabaseError);
        
        // Special handling for recursive RLS policy errors
        if (supabaseError.message?.includes('infinite recursion')) {
          setError("Unable to fetch users due to a database policy issue.");
          toast.error("A database error occurred. This is likely due to a policy configuration issue.", {
            duration: 5000,
          });
        } else {
          setError(supabaseError.message);
        }
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [user, fetchUsers]);

  // For backward compatibility with ExpenseDetail.tsx
  return { 
    users, 
    loading, 
    error,
    expenseUsers: users,
    isLoading: loading
  };
};
