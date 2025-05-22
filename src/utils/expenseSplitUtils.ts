
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { supabase } from "@/integrations/supabase/client";

export const processSplitData = async (
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
