
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { fetchExpenseById, fetchUsers, saveExpense, fetchGroupDetails } from '@/services/expenseService';
import { Expense } from '@/types/expenses';
import { expenseToFormValues } from '@/utils/expenseFormUtils';
import { UserSplitData } from '@/types/expenses';
import { processSplitData } from '@/utils/expenseSplitUtils';
import { supabase } from '@/integrations/supabase/client';

// Re-export the schema for convenience
export { expenseFormSchema, splitDataSchema } from '@/schemas/expenseFormSchema';
export type { ExpenseFormValues } from '@/schemas/expenseFormSchema';

export const useExpenseForm = (groupId: string | null) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [groupName, setGroupName] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load data in parallel for better performance
        const promises = [];
        
        // Load expense if editing
        if (id) {
          promises.push(
            fetchExpenseById(id).then(expenseData => setExpense(expenseData))
          );
        }
        
        // Load users
        promises.push(
          fetchUsers(groupId).then(usersData => setUsers(usersData))
        );
        
        // Load group name if groupId is provided
        if (groupId) {
          promises.push(
            fetchGroupDetails(groupId).then(groupDetails => {
              if (groupDetails) {
                setGroupName(groupDetails.name);
              }
            }).catch(error => {
              console.error("Error fetching group details:", error);
            })
          );
        }
        
        await Promise.all(promises);
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, user, groupId]);

  const getDefaultValues = (): ExpenseFormValues => {
    return expenseToFormValues(expense, user?.id);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    setSubmitLoading(true);
    
    try {
      // Process participants into split data
      const splitMethodMap: Record<string, string> = {
        'equal': 'equal',
        'custom': 'amount',
        'percentage': 'percentage'
      };
      
      const actualSplitMethod = values.splitMethod ? splitMethodMap[values.splitMethod] : 'equal';
      
      // If we have participant IDs, convert them to split data
      if (values.participants && values.participants.length > 0) {
        const splitData: UserSplitData[] = values.participants.map(userId => ({
          userId,
          isActive: true
        }));
        
        values.splitData = splitData;
      }
      
      // Save with correct split method
      values.splitEqually = actualSplitMethod === 'equal';
      
      const expenseId = await saveExpense(values, id, groupId);
      if (expenseId) {
        navigate(groupId ? `/group/${groupId}` : '/');
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      throw error;
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
    isEditing: !!id,
    groupName
  };
};
