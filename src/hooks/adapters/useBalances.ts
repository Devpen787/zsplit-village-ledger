
import { useState, useEffect, useCallback, useMemo } from 'react';
import { storageAdapter } from '@/adapters';
import { useAuth } from '@/contexts';
import { Balance } from '@/adapters/types';
import { toast } from '@/components/ui/sonner';

interface UseBalancesReturn {
  balances: Balance[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  hasRecursionError: boolean;
  handleRefresh: () => void;
  isEmpty: boolean;
  totalUsers: number;
}

export const useBalances = (): UseBalancesReturn => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const { user } = useAuth();

  const isEmpty = useMemo(() => balances.length === 0, [balances.length]);
  const totalUsers = useMemo(() => balances.length, [balances.length]);

  const fetchBalances = useCallback(async () => {
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    setError(null);
    setHasRecursionError(false);

    try {
      console.log("Fetching balances for user:", user.id);
      
      const data = await storageAdapter.calculateBalances();
      console.log("Balances data received:", data);
      setBalances(data);
    } catch (err: any) {
      console.error("Error fetching balances:", err);
      
      if (err.message?.includes('infinite recursion') || err.code === '42P17') {
        setHasRecursionError(true);
        setError("Database policy configuration issue");
        
        const mockBalance: Balance = {
          user_id: user.id,
          user_name: user.name || user.email.split('@')[0],
          user_email: user.email,
          amount: 0
        };
        setBalances([mockBalance]);
        
        toast.error("A database error occurred. This is likely due to a policy configuration issue.", {
          duration: 5000,
        });
      } else {
        setError(err.message || "Failed to fetch balances");
        toast.error("Failed to load balances. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchBalances();
    } else {
      setBalances([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchBalances]);

  return { 
    balances, 
    loading, 
    error, 
    refreshing, 
    hasRecursionError, 
    handleRefresh,
    isEmpty,
    totalUsers
  };
};
