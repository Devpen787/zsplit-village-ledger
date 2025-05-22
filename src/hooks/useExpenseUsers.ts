
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';

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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        console.log("Fetching users for expense selection");
        
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('id, name, email');

        if (supabaseError) {
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
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // For backward compatibility with ExpenseDetail.tsx
  return { 
    users, 
    loading, 
    error,
    expenseUsers: users,
    isLoading: loading
  };
};
