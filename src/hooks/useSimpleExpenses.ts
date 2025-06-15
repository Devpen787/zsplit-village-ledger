
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts";

export interface SimpleExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  group_id?: string;
  paid_by_user?: {
    name: string;
    email: string;
  } | null;
}

export const useSimpleExpenses = (limit?: number, groupId?: string) => {
  const [expenses, setExpenses] = useState<SimpleExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedExpenses, setGroupedExpenses] = useState<Record<string, SimpleExpense[]>>({});
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError("Not authenticated");
        return;
      }
      
      console.log("[SIMPLE EXPENSES] Fetching expenses", { limit, groupId, userId: user?.id });
      
      // Build the query without RLS complications
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      // Add group filter if provided
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
        
      if (limit) {
        query = query.limit(limit);
      }

      const { data: expensesData, error: expensesError } = await query;

      if (expensesError) {
        console.error("[SIMPLE EXPENSES] Error fetching expenses:", expensesError);
        setError(expensesError.message);
        return;
      }

      console.log("[SIMPLE EXPENSES] Raw expenses data:", expensesData);

      if (!expensesData || expensesData.length === 0) {
        setExpenses([]);
        setGroupedExpenses({});
        return;
      }

      // Fetch user details for paid_by users
      const userIds = [...new Set(expensesData.map(expense => expense.paid_by))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      // Transform the data to match our Expense type
      const formattedExpenses: SimpleExpense[] = expensesData.map((expense: any) => {
        const userData = usersData?.find(user => user.id === expense.paid_by);
        
        return {
          id: expense.id,
          title: expense.title || 'Unnamed Expense',
          amount: expense.amount || 0,
          currency: expense.currency || 'CHF',
          date: expense.date || new Date().toISOString(),
          paid_by: expense.paid_by,
          group_id: expense.group_id,
          paid_by_user: userData ? {
            name: userData.name || 'Unknown',
            email: userData.email
          } : null
        };
      });

      setExpenses(formattedExpenses);
      
      // Group expenses by date
      const grouped = formattedExpenses.reduce((acc: Record<string, SimpleExpense[]>, expense) => {
        const dateKey = new Date(expense.date).toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        
        acc[dateKey].push(expense);
        return acc;
      }, {});
      
      setGroupedExpenses(grouped);
    } catch (err: any) {
      console.error('[SIMPLE EXPENSES] Error fetching expenses:', err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [limit, groupId, user]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [fetchExpenses]);

  return {
    expenses,
    groupedExpenses,
    loading,
    error,
    fetchExpenses
  };
};
