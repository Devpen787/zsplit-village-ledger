
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/contexts';
import { z } from 'zod';
import { Expense } from '@/types/expenses';

// Define the split data types
export const splitDataSchema = z.array(
  z.object({
    userId: z.string(),
    amount: z.number().optional(),
    percentage: z.number().optional(),
    shares: z.number().optional(),
  })
);

export const expenseFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.number().positive({
    message: "Amount must be greater than 0",
  }),
  currency: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  paidBy: z.string(),
  splitEqually: z.boolean().default(true),
  splitData: splitDataSchema.optional(),
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
        let query = supabase.from('users').select('*');

        // If we have a group ID, filter users by group members
        if (groupId) {
          const { data: groupMembers, error: membersError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', groupId);

          if (membersError) {
            console.error("Error fetching group members:", membersError);
          } else if (groupMembers && groupMembers.length > 0) {
            const userIds = groupMembers.map(member => member.user_id);
            query = query.in('id', userIds);
          }
        }

        const { data, error } = await query;

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
  }, [id, user, groupId]);

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

  const processSplitData = async (
    expenseId: string, 
    values: ExpenseFormValues, 
    splitMethod: string
  ) => {
    if (!values.splitData || values.splitData.length === 0) {
      return;
    }

    const splitData = values.splitData;
    const totalAmount = values.amount;
    
    // Calculate shares for each user based on split method
    const expenseMembers = splitData.map(data => {
      let shareValue = 0;
      
      switch (splitMethod) {
        case 'equal':
          shareValue = totalAmount / splitData.length;
          break;
        case 'amount':
          shareValue = data.amount || 0;
          break;
        case 'percentage':
          shareValue = totalAmount * ((data.percentage || 0) / 100);
          break;
        case 'shares':
          const totalShares = splitData.reduce((sum, item) => sum + (item.shares || 0), 0);
          shareValue = totalAmount * ((data.shares || 0) / totalShares);
          break;
      }
      
      return {
        expense_id: expenseId,
        user_id: data.userId,
        share_type: splitMethod,
        share_value: shareValue,
        share: 1, // Default share value
      };
    });
    
    // Insert expense members
    const { error } = await supabase
      .from('expense_members')
      .upsert(expenseMembers);
    
    if (error) {
      console.error("Error saving expense members:", error);
      throw new Error("Failed to save expense split data");
    }
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

      let expenseId = id;
      let response;
      
      if (id) {
        response = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id);
      } else {
        response = await supabase
          .from('expenses')
          .insert([expenseData])
          .select();
          
        if (response.data && response.data.length > 0) {
          expenseId = response.data[0].id;
        }
      }

      if (response.error) {
        console.error("Error saving expense:", response.error);
        toast.error("Failed to save expense.");
        return;
      }
      
      // Determine which split method is being used
      const splitMethod = values.splitEqually ? 'equal' : 
                         values.splitData && values.splitData[0].percentage ? 'percentage' : 
                         values.splitData && values.splitData[0].shares ? 'shares' : 'amount';
      
      // Process and save split data
      if (expenseId) {
        await processSplitData(expenseId, values, splitMethod);
      }

      toast.success("Expense saved successfully!");
      navigate(groupId ? `/group/${groupId}` : '/');
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
