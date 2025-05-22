import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Expense } from '@/types/expenses';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { processSplitData } from '@/utils/expenseSplitUtils';

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching expense:", error);
      toast.error("Failed to load expense.");
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    toast.error("Failed to load expense.");
    return null;
  }
};

export const fetchUsers = async (groupId: string | null) => {
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
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to load users.");
    return [];
  }
};

export const saveExpense = async (values: ExpenseFormValues, id: string | undefined, groupId: string | null) => {
  try {
    const amountNumber = parseFloat(values.amount.toString());

    if (isNaN(amountNumber)) {
      toast.error("Invalid amount entered.");
      return null;
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
      return null;
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
    return expenseId;
  } catch (error) {
    console.error("Error saving expense:", error);
    toast.error("Failed to save expense.");
    return null;
  }
};

// Add this new function to fetch group details by ID
export const fetchGroupDetails = async (groupId: string) => {
  try {
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to load group details");
      return null;
    }
    
    return group;
  } catch (error) {
    console.error("Error fetching group details:", error);
    toast.error("Failed to load group details");
    return null;
  }
};
