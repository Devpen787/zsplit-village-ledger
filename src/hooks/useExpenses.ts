
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts";
import { Expense } from "@/types/expenses";

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
      
      // Build the query
      let query = supabase
        .from('expenses')
        .select(`
          id,
          title,
          amount,
          currency,
          date,
          paid_by,
          users:paid_by (
            name,
            email
          )
        `)
        .order('date', { ascending: false });
        
      // Add group filter if provided
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
        
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error("Error fetching expenses:", supabaseError);
        
        // Special handling for recursive RLS policy errors
        if (supabaseError.message?.includes('infinite recursion') || supabaseError.code === '42P17') {
          setHasRecursionError(true);
          setError("Database policy configuration issue");
          setExpenses([]);
          setGroupedExpenses({});
          return;
        } else {
          setError(supabaseError.message);
        }
        return;
      }

      console.log("Expenses data:", data);

      if (!data || data.length === 0) {
        setExpenses([]);
        setGroupedExpenses({});
        return;
      }

      // Transform the data to match our Expense type
      const formattedExpenses = data.map((expense: any) => ({
        id: expense.id,
        title: expense.title || 'Unnamed Expense',
        amount: expense.amount || 0,
        currency: expense.currency || 'CHF',
        date: expense.date || new Date().toISOString(),
        paid_by: expense.paid_by,
        paid_by_user: expense.users
      }));

      setExpenses(formattedExpenses);
      
      // Group expenses by date
      const grouped = formattedExpenses.reduce((acc: Record<string, Expense[]>, expense) => {
        // Format the date as YYYY-MM-DD
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
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [limit, groupId, user]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      
      // Set up realtime subscription for expenses
      const expensesChannel = supabase
        .channel('expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          () => fetchExpenses()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(expensesChannel);
      };
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
