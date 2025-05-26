
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { Expense } from '@/types/expenses';

export const useGroupExpenses = (id: string | undefined, user: User | null) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!id || !user) return;
        
        // Build the query
        const { data, error: supabaseError } = await supabase
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
          .eq('group_id', id)
          .order('date', { ascending: false });

        if (supabaseError) {
          console.error("Error fetching expenses:", supabaseError);
          return;
        }

        // Transform the data
        const formattedExpenses = data?.map((expense: any) => ({
          id: expense.id,
          title: expense.title || 'Unnamed Expense',
          amount: expense.amount || 0,
          currency: expense.currency || 'CHF',
          date: expense.date || new Date().toISOString(),
          paid_by: expense.paid_by,
          paid_by_user: expense.users
        })) || [];

        setExpenses(formattedExpenses);
        
        // Calculate total expenses
        const total = formattedExpenses.reduce(
          (sum: number, expense: Expense) => sum + Number(expense.amount || 0),
          0
        );
        
        setTotalExpenses(total);
      } catch (err: any) {
        console.error('Error fetching expenses:', err);
      }
    };
    
    fetchExpenses();
    
    // Set up real-time subscription for expenses
    if (id) {
      const expensesChannel = supabase
        .channel('expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses', filter: id ? `group_id=eq.${id}` : undefined },
          () => fetchExpenses()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(expensesChannel);
      };
    }
  }, [id, user]);

  return {
    expenses,
    totalExpenses
  };
};
