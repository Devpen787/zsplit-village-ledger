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
  const { user } = useAuth();

  useEffect(() => {
    const fetchBalances = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          setError("Not authenticated");
          return;
        }

        const { data, error } = await supabase.rpc('calculate_balances');

        if (error) {
          console.error("Error fetching balances:", error);
          setError(error.message);
        } else {
          const formattedBalances = data.map((item: any) => ({
            user_id: item.user_id,
            user_name: item.user_name,
            user_email: item.user_email,
            amount: parseFloat(item.balance),
          }));
          setBalances(formattedBalances);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching balances:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [user]);

  return { balances, loading, error };
};
