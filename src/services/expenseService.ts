
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

export const saveExpense = async (
  values: ExpenseFormValues, 
  id: string | undefined, 
  groupId: string | null,
  currentUserId: string
) => {
  try {
    console.log('[EXPENSE SERVICE] Starting saveExpense with:', {
      values: values,
      id: id,
      groupId: groupId,
      currentUserId: currentUserId,
      hasCurrentUser: !!currentUserId
    });

    // Validate current user is provided
    if (!currentUserId) {
      console.error('[EXPENSE SERVICE] No current user ID provided');
      toast.error("Authentication required. Please log in again.");
      return null;
    }

    const amountNumber = parseFloat(values.amount.toString());

    if (isNaN(amountNumber)) {
      console.error('[EXPENSE SERVICE] Invalid amount:', values.amount);
      toast.error("Invalid amount entered.");
      return null;
    }

    console.log('[EXPENSE SERVICE] Current user authenticated:', currentUserId);

    const expenseData = {
      title: values.title,
      amount: amountNumber,
      currency: values.currency,
      date: values.date.toISOString(),
      leftover_notes: values.notes,
      paid_by: values.paidBy,
      group_id: groupId,
    };

    console.log('[EXPENSE SERVICE] Expense data to save:', expenseData);

    let expenseId = id;
    let response;
    
    if (id) {
      console.log('[EXPENSE SERVICE] Updating existing expense:', id);
      // Update existing expense
      response = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();
    } else {
      console.log('[EXPENSE SERVICE] Creating new expense with edge function');
      // Create new expense using the edge function
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('create-expense', {
          body: {
            ...expenseData,
            created_by: currentUserId
          }
        });

        console.log('[EXPENSE SERVICE] Edge function response:', { functionData, functionError });

        if (functionError) {
          console.error("[EXPENSE SERVICE] Error from create-expense function:", functionError);
          throw functionError;
        }

        if (functionData?.data) {
          expenseId = functionData.data.id;
          response = { data: functionData.data, error: null };
          console.log('[EXPENSE SERVICE] Edge function created expense:', expenseId);
        } else {
          throw new Error("No data returned from create-expense function");
        }
      } catch (functionError) {
        console.error("[EXPENSE SERVICE] Function call failed, falling back to direct insert:", functionError);
        
        // Fallback to direct insert
        response = await supabase
          .from('expenses')
          .insert([expenseData])
          .select()
          .single();
          
        if (response.data) {
          expenseId = response.data.id;
          console.log('[EXPENSE SERVICE] Direct insert created expense:', expenseId);
        }
      }
    }

    if (response.error) {
      console.error("[EXPENSE SERVICE] Error saving expense:", response.error);
      toast.error("Failed to save expense.");
      return null;
    }
    
    console.log('[EXPENSE SERVICE] Expense saved successfully:', response.data);
    
    // Determine which split method is being used
    const splitMethod = values.splitEqually ? 'equal' : 
                       values.splitData && values.splitData[0]?.percentage ? 'percentage' : 
                       values.splitData && values.splitData[0]?.shares ? 'shares' : 'amount';
    
    console.log('[EXPENSE SERVICE] Split method:', splitMethod);
    console.log('[EXPENSE SERVICE] Split data:', values.splitData);
    
    // Process and save split data
    if (expenseId && values.splitData && values.splitData.length > 0) {
      try {
        await processSplitData(expenseId, values, splitMethod);
        console.log('[EXPENSE SERVICE] Split data processed successfully');
      } catch (splitError) {
        console.error('[EXPENSE SERVICE] Error processing split data:', splitError);
        // Don't fail the whole operation for split data issues
      }
    }

    toast.success("Expense saved successfully!");
    return expenseId;
  } catch (error) {
    console.error("[EXPENSE SERVICE] Error saving expense:", error);
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
