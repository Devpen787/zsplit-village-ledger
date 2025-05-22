
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ExpenseFormValues } from '@/schemas/expenseFormSchema';
import { fetchExpenseById, fetchUsers, saveExpense, fetchGroupDetails } from '@/services/expenseService';
import { Expense } from '@/types/expenses';

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
      
      // Load expense if editing
      if (id) {
        const expenseData = await fetchExpenseById(id);
        setExpense(expenseData);
      }
      
      // Load users
      const usersData = await fetchUsers(groupId);
      setUsers(usersData);
      
      // Load group name if groupId is provided
      if (groupId) {
        try {
          const groupDetails = await fetchGroupDetails(groupId);
          if (groupDetails) {
            setGroupName(groupDetails.name);
          }
        } catch (error) {
          console.error("Error fetching group details:", error);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
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

  const onSubmit = async (values: ExpenseFormValues) => {
    setSubmitLoading(true);
    try {
      const expenseId = await saveExpense(values, id, groupId);
      if (expenseId) {
        navigate(groupId ? `/group/${groupId}` : '/');
      }
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
