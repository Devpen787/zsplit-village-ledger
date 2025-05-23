
import { Expense } from '@/types/expenses';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';

/**
 * Converts an expense object from the database to form values
 */
export const expenseToFormValues = (expense: Expense | null, userId: string | undefined): ExpenseFormValues => {
  if (expense) {
    return {
      title: expense.title || '',
      amount: expense.amount || 0,
      currency: expense.currency || 'USD',
      date: expense.date ? new Date(expense.date) : new Date(),
      notes: expense.leftover_notes || '',
      paidBy: expense.paid_by || userId || '',
      splitEqually: true,
    };
  }
  
  return {
    title: '',
    amount: 0,
    currency: 'USD',
    date: new Date(),
    notes: '',
    paidBy: userId || '',
    splitEqually: true,
  };
};

/**
 * Process the split data for submission based on the split method
 */
export const processSplitData = async (
  expenseId: string, 
  values: ExpenseFormValues, 
  splitMethod: string
) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // First, remove any existing split data for this expense
  try {
    await supabase
      .from('expense_members')
      .delete()
      .eq('expense_id', expenseId);
  } catch (error) {
    console.error("Error removing existing expense members:", error);
  }
  
  // If we have split data, add it
  if (values.splitData && values.splitData.length > 0) {
    // Filter to only active users
    const activeData = values.splitData.filter(item => item.isActive !== false);
    
    // Create expense_members entries for each active user
    const expenseMembers = activeData.map(item => {
      let shareValue = 0;
      
      switch (splitMethod) {
        case 'equal':
          shareValue = 1;
          break;
        case 'amount':
          shareValue = item.amount || 0;
          break;
        case 'percentage':
          shareValue = item.percentage || 0;
          break;
        case 'shares':
          shareValue = item.shares || 0;
          break;
      }
      
      return {
        expense_id: expenseId,
        user_id: item.userId,
        share_type: splitMethod,
        share_value: shareValue,
        share: 0, // This will be calculated by the backend
      };
    });
    
    try {
      await supabase
        .from('expense_members')
        .insert(expenseMembers);
    } catch (error) {
      console.error("Error inserting expense members:", error);
      throw error;
    }
  }
};
