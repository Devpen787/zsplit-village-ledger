
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { Balance } from '@/types/supabase';

export const useBalances = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Call the calculate_balances function with the improved implementation
      const { data, error } = await supabase.rpc('calculate_balances');

      if (error) {
        console.error("Error fetching balances:", error);
        setError(error.message);
      } else if (Array.isArray(data)) {
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
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBalances();
  };

  useEffect(() => {
    fetchBalances();
  }, [user]);

  return { balances, loading, error, refreshing, handleRefresh };
};
