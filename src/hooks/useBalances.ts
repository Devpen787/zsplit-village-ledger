
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
  const { user } = useAuth();

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);

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
        if (error.message?.includes('infinite recursion')) {
          setError("Unable to calculate balances due to a database policy issue. Please contact support.");
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

  return { balances, loading, error, refreshing, handleRefresh };
};
