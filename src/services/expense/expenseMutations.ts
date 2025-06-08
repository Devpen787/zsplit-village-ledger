
import { storageAdapter } from "@/adapters";
import { toast } from "@/components/ui/sonner";
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { processSplitData } from '@/utils/expenseFormUtils';

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
      paid_by: values.paidBy,
      group_id: groupId || undefined,
    };

    console.log('[EXPENSE SERVICE] Expense data to save:', expenseData);

    let expenseId = id;
    
    if (id) {
      console.log('[EXPENSE SERVICE] Updating existing expense:', id);
      await storageAdapter.updateExpense(id, expenseData);
    } else {
      console.log('[EXPENSE SERVICE] Creating new expense');
      const newExpense = await storageAdapter.createExpense({
        ...expenseData,
        id: '', // Will be generated
      });
      expenseId = newExpense.id;
      console.log('[EXPENSE SERVICE] Created expense:', expenseId);
    }
    
    console.log('[EXPENSE SERVICE] Expense saved successfully');
    
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
