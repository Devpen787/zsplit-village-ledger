
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
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('id, name, email');

        if (supabaseError) {
          setError(supabaseError.message);
        } else {
          setUsers(data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
