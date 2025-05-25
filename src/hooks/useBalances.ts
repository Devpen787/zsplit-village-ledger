
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { Balance } from '@/types/supabase';
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

  // Memoized computed values
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
      
      // Call the calculate_balances function with timeout handling
      const { data, error: fetchError } = await supabase.rpc('calculate_balances');

      if (fetchError) {
        console.error("Error fetching balances:", fetchError);
        
        // Enhanced error handling for different error types
        if (fetchError.message?.includes('infinite recursion') || fetchError.code === '42P17') {
          setHasRecursionError(true);
          setError("Database policy configuration issue");
          
          // Create mock data for UI functionality
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
          setError(fetchError.message || "Failed to fetch balances");
          toast.error("Failed to load balances. Please try again.");
        }
      } else if (Array.isArray(data)) {
        console.log("Balances data received:", data);
        
        // Map and validate the response data
        const formattedBalances: Balance[] = data
          .filter(item => item && typeof item === 'object') // Filter out invalid items
          .map(item => ({
            user_id: item.user_id,
            user_name: item.user_name,
            user_email: item.user_email,
            amount: Number(item.amount) || 0 // Ensure amount is a number
          }));
        
        setBalances(formattedBalances);
      } else {
        console.error("Unexpected data format:", data);
        setError("Invalid data format received from server");
        toast.error("Received invalid data format from server");
      }
    } catch (err: any) {
      console.error("Unexpected error fetching balances:", err);
      const errorMessage = err.message || "An unknown error occurred";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
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
