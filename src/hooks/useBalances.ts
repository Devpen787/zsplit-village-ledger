
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { Balance } from '@/types/supabase';
import { toast } from '@/components/ui/sonner';

export const useBalances = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const { user } = useAuth();

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasRecursionError(false);

    try {
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      console.log("Fetching balances for user:", user.id);
      
      // Call the calculate_balances function with a timeout to avoid potential RLS issues
      const { data, error } = await supabase.rpc('calculate_balances');

      if (error) {
        console.error("Error fetching balances:", error);
        
        // Special handling for recursive RLS policy errors
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          setHasRecursionError(true);
          setError("Database policy configuration issue");
          
          // Create mock data for UI to show something rather than error
          if (user) {
            const mockBalance: Balance = {
              user_id: user.id,
              user_name: user.name || user.email.split('@')[0],
              user_email: user.email,
              amount: 0
            };
            setBalances([mockBalance]);
          }
          
          toast.error("A database error occurred. This is likely due to a policy configuration issue.", {
            duration: 5000,
          });
        } else {
          setError(error.message);
        }
      } else if (Array.isArray(data)) {
        console.log("Balances data received:", data);
        // Map the response to the Balance type
        const formattedBalances: Balance[] = data.map(item => ({
          user_id: item.user_id,
          user_name: item.user_name,
          user_email: item.user_email,
          amount: item.amount
        }));
        setBalances(formattedBalances);
      } else {
        console.error("Unexpected data format:", data);
        setError("Invalid data format received from server");
      }
    } catch (err: any) {
      console.error("Unexpected error fetching balances:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBalances();
  };

  useEffect(() => {
    if (user) {
      fetchBalances();
    } else {
      setBalances([]);
    }
  }, [user, fetchBalances]);

  return { balances, loading, error, refreshing, handleRefresh, hasRecursionError };
};
