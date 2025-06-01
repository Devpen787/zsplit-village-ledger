
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Expense } from '@/types/expenses';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { processSplitData } from '@/utils/expenseFormUtils';

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
    console.log('Saving expense with values:', values);
    console.log('Group ID:', groupId);
    
    const amountNumber = parseFloat(values.amount.toString());

    if (isNaN(amountNumber)) {
      toast.error("Invalid amount entered.");
      return null;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create expenses.");
      return null;
    }

    console.log('Current user:', user.id);

    const expenseData = {
      title: values.title,
      amount: amountNumber,
      currency: values.currency,
      date: values.date.toISOString(),
      leftover_notes: values.notes,
      paid_by: values.paidBy,
      group_id: groupId,
    };

    console.log('Expense data to save:', expenseData);

    let expenseId = id;
    let response;
    
    if (id) {
      // Update existing expense
      response = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Create new expense using the edge function
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('create-expense', {
          body: {
            ...expenseData,
            created_by: user.id
          }
        });

        if (functionError) {
          console.error("Error from create-expense function:", functionError);
          throw functionError;
        }

        if (functionData?.data) {
          expenseId = functionData.data.id;
          response = { data: functionData.data, error: null };
        } else {
          throw new Error("No data returned from create-expense function");
        }
      } catch (functionError) {
        console.error("Function call failed, falling back to direct insert:", functionError);
        
        // Fallback to direct insert
        response = await supabase
          .from('expenses')
          .insert([expenseData])
          .select()
          .single();
          
        if (response.data) {
          expenseId = response.data.id;
        }
      }
    }

    if (response.error) {
      console.error("Error saving expense:", response.error);
      toast.error("Failed to save expense.");
      return null;
    }
    
    console.log('Expense saved successfully:', response.data);
    
    // Determine which split method is being used
    const splitMethod = values.splitEqually ? 'equal' : 
                       values.splitData && values.splitData[0]?.percentage ? 'percentage' : 
                       values.splitData && values.splitData[0]?.shares ? 'shares' : 'amount';
    
    console.log('Split method:', splitMethod);
    console.log('Split data:', values.splitData);
    
    // Process and save split data
    if (expenseId && values.splitData && values.splitData.length > 0) {
      try {
        await processSplitData(expenseId, values, splitMethod);
        console.log('Split data processed successfully');
      } catch (splitError) {
        console.error('Error processing split data:', splitError);
        // Don't fail the whole operation for split data issues
      }
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
      .maybeSingle();

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
