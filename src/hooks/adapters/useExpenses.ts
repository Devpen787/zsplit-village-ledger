
import { useState, useEffect, useCallback } from "react";
import { storageAdapter } from "@/adapters";
import { useAuth } from "@/contexts";
import { Expense } from "@/adapters/types";

export const useExpenses = (limit?: number, groupId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const [groupedExpenses, setGroupedExpenses] = useState<Record<string, Expense[]>>({});
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setHasRecursionError(false);
      
      if (!user) {
        setError("Not authenticated");
        return;
      }
      
      console.log("Fetching expenses", { limit, groupId, userId: user?.id });
      
      const data = await storageAdapter.getExpenses(groupId, limit);
      console.log("Expenses data:", data);

      if (!data || data.length === 0) {
        setExpenses([]);
        setGroupedExpenses({});
        return;
      }

      setExpenses(data);
      
      // Group expenses by date
      const grouped = data.reduce((acc: Record<string, Expense[]>, expense) => {
        const dateKey = new Date(expense.date).toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        
        acc[dateKey].push(expense);
        return acc;
      }, {});
      
      setGroupedExpenses(grouped);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      
      if (err.message?.includes('infinite recursion') || err.code === '42P17') {
        setHasRecursionError(true);
        setError("Database policy configuration issue");
        setExpenses([]);
        setGroupedExpenses({});
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [limit, groupId, user]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      
      // Set up realtime subscription for expenses
      const unsubscribe = storageAdapter.subscribeToChanges(
        'expenses',
        () => fetchExpenses(),
        groupId ? `group_id=eq.${groupId}` : undefined
      );

      return unsubscribe;
    }
  }, [limit, groupId, user, fetchExpenses]);

  return {
    expenses,
    groupedExpenses,
    loading,
    error,
    hasRecursionError,
    fetchExpenses
  };
};
