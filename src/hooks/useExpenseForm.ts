import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { fetchExpenseById, fetchUsers, saveExpense, fetchGroupDetails } from '@/services/expense';
import { Expense } from '@/types/expenses';
import { expenseToFormValues } from '@/utils/expenseFormUtils';

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
        console.log('[EXPENSE FORM] Loading data for user:', user?.id);
        
        // Load data in parallel for better performance
        const promises = [];
        
        // Load expense if editing
        if (id) {
          console.log('[EXPENSE FORM] Loading expense for editing:', id);
          promises.push(
            fetchExpenseById(id).then(expenseData => {
              console.log('[EXPENSE FORM] Loaded expense:', expenseData);
              setExpense(expenseData);
            })
          );
        }
        
        // Load users
        console.log('[EXPENSE FORM] Loading users for group:', groupId);
        promises.push(
          fetchUsers(groupId).then(usersData => {
            console.log('[EXPENSE FORM] Loaded users:', usersData);
            setUsers(usersData);
          })
        );
        
        // Load group name if groupId is provided
        if (groupId) {
          console.log('[EXPENSE FORM] Loading group details:', groupId);
          promises.push(
            fetchGroupDetails(groupId).then(groupDetails => {
              if (groupDetails) {
                console.log('[EXPENSE FORM] Loaded group details:', groupDetails);
                setGroupName(groupDetails.name);
              }
            }).catch(error => {
              console.error("[EXPENSE FORM] Error fetching group details:", error);
            })
          );
        }
        
        await Promise.all(promises);
      } catch (error) {
        console.error("[EXPENSE FORM] Error loading form data:", error);
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
    console.log('[EXPENSE FORM] Starting submit with values:', values);
    console.log('[EXPENSE FORM] Current user:', user);
    console.log('[EXPENSE FORM] Group ID:', groupId);
    
    if (!user?.id) {
      console.error('[EXPENSE FORM] No authenticated user found');
      toast.error("You must be logged in to create expenses.");
      return;
    }
    
    setSubmitLoading(true);
    try {
      const expenseId = await saveExpense(values, id, groupId, user.id);
      if (expenseId) {
        console.log('[EXPENSE FORM] Expense saved successfully, navigating...');
        navigate(groupId ? `/group/${groupId}` : '/');
      } else {
        console.error('[EXPENSE FORM] Failed to save expense');
      }
    } catch (error) {
      console.error('[EXPENSE FORM] Error during submit:', error);
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
