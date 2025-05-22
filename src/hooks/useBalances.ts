
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';

interface Balance {
  user_id: string;
  user_name: string | null;
  user_email: string;
  amount: number;
}

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

      // Use type assertion to bypass the TypeScript error
      const { data, error } = await supabase.rpc('calculate_balances' as any);

      if (error) {
        console.error("Error fetching balances:", error);
        setError(error.message);
      } else if (Array.isArray(data)) {
        const formattedBalances = data.map((item: any) => ({
          user_id: item.user_id,
          user_name: item.user_name,
          user_email: item.user_email,
          amount: parseFloat(item.balance),
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
