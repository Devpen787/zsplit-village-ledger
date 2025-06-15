
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';

export const useSimpleExpenseCreation = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createExpense = async (expenseData: {
    title: string;
    amount: number;
    currency: string;
    date: string;
    paid_by: string;
    group_id?: string;
    leftover_notes?: string;
  }) => {
    if (!user) {
      toast.error("Must be logged in to create expense");
      return null;
    }

    setLoading(true);
    try {
      console.log("[EXPENSE CREATION] Creating expense:", expenseData);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          title: expenseData.title,
          amount: expenseData.amount,
          currency: expenseData.currency,
          date: expenseData.date,
          paid_by: expenseData.paid_by,
          group_id: expenseData.group_id || null,
          leftover_notes: expenseData.leftover_notes || null
        })
        .select()
        .single();

      if (error) {
        console.error("[EXPENSE CREATION] Error creating expense:", error);
        throw error;
      }

      console.log("[EXPENSE CREATION] Expense created successfully:", data);
      toast.success('Expense created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast.error(`Failed to create expense: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createExpense,
    loading
  };
};
