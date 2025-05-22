
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/contexts';
import { z } from 'zod';
import { Expense } from '@/types/expenses';

export const expenseFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.number(),
  currency: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  paidBy: z.string(),
  splitEqually: z.boolean().default(true),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const useExpenseForm = (groupId: string | null) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            console.error("Error fetching expense:", error);
            toast.error("Failed to load expense.");
          } else {
            setExpense(data);
          }
        } catch (error) {
          console.error("Error fetching expense:", error);
          toast.error("Failed to load expense.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users.");
        } else {
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    fetchExpense();
    fetchUsers();
  }, [id, user]);

  const getDefaultValues = (): ExpenseFormValues => {
    if (expense) {
      return {
        title: expense.title || '',
        amount: expense.amount || 0,
        currency: expense.currency || 'USD',
        date: expense.date ? new Date(expense.date) : new Date(),
        notes: expense.leftover_notes || '',
        paidBy: expense.paid_by || user?.id || '',
        splitEqually: true,
      };
    }
    
    return {
      title: '',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      notes: '',
      paidBy: user?.id || '',
      splitEqually: true,
    };
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    setSubmitLoading(true);
    try {
      const amountNumber = parseFloat(values.amount.toString());

      if (isNaN(amountNumber)) {
        toast.error("Invalid amount entered.");
        return;
      }

      const expenseData = {
        title: values.title,
        amount: amountNumber,
        currency: values.currency,
        date: values.date.toISOString(),
        leftover_notes: values.notes,
        paid_by: values.paidBy,
        group_id: groupId,
      };

      let response;
      if (id) {
        response = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id);
      } else {
        response = await supabase
          .from('expenses')
          .insert([expenseData]);
      }

      if (response.error) {
        console.error("Error saving expense:", response.error);
        toast.error("Failed to save expense.");
      } else {
        toast.success("Expense saved successfully!");
        navigate(groupId ? `/group/${groupId}` : '/');
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Failed to save expense.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    expense,
    loading,
    users,
    submitLoading,
    getDefaultValues,
    onSubmit,
    isEditing: !!id
  };
};
