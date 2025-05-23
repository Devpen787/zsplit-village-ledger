
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  group_id?: string | null;
  group_name?: string | null;
  leftover_notes?: string | null;
  paid_by_user?: {
    name: string | null;
    email: string;
    display_name: string | null;
  };
};

export const useExpenseDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedCurrency, setEditedCurrency] = useState('CHF');
  const [editedDate, setEditedDate] = useState<Date | null>(null);
  const [editedPaidBy, setEditedPaidBy] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (!id) {
      console.error("Expense ID is missing");
      return;
    }

    const fetchExpense = async () => {
      setLoading(true);
      try {
        // Join with groups table to get group name and users table to get user details
        const { data, error } = await supabase
          .from('expenses')
          .select(`
            *,
            groups (
              name
            ),
            users:paid_by (
              name,
              email,
              display_name
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const expenseWithDetails = {
          ...data,
          group_name: data.groups?.name,
          paid_by_user: data.users
        };
        
        setExpense(expenseWithDetails);
        setEditedTitle(data.title);
        setEditedAmount(String(data.amount));
        setEditedCurrency(data.currency);
        setEditedDate(new Date(data.date));
        setEditedPaidBy(data.paid_by);
      } catch (error: any) {
        console.error("Error fetching expense:", error.message);
        toast.error("Failed to load expense details.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTitle(expense?.title || '');
    setEditedAmount(String(expense?.amount) || '');
    setEditedCurrency(expense?.currency || 'CHF');
    setEditedDate(expense ? new Date(expense.date) : null);
    setEditedPaidBy(expense?.paid_by || '');
  };

  const handleSaveClick = async () => {
    if (!id) {
      console.error("Expense ID is missing");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          title: editedTitle,
          amount: parseFloat(editedAmount),
          currency: editedCurrency,
          date: editedDate ? editedDate.toISOString() : null,
          paid_by: editedPaidBy,
        })
        .eq('id', id);

      if (error) throw error;

      // Optimistically update the local state
      setExpense({
        ...expense!,
        title: editedTitle,
        amount: parseFloat(editedAmount),
        currency: editedCurrency,
        date: editedDate!.toISOString(),
        paid_by: editedPaidBy,
      });

      toast.success("Expense updated successfully!");
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Error updating expense:", error.message);
      toast.error("Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!id) {
      console.error("Expense ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Expense deleted successfully!");
      
      // Navigate back to the group page if we have a group_id, otherwise to dashboard
      if (expense?.group_id) {
        navigate(`/group/${expense.group_id}`);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error("Error deleting expense:", error.message);
      toast.error("Failed to delete expense.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!expense) return;

    setIsCopying(true);
    try {
      const groupInfo = expense.group_name ? `Group: ${expense.group_name}\n` : '';
      const expenseText = `Expense: ${expense.title}\nAmount: ${expense.amount} ${expense.currency}\nDate: ${new Date(expense.date).toLocaleDateString()}\n${groupInfo}`;
      await navigator.clipboard.writeText(expenseText);
      toast.success("Expense details copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy expense details to clipboard.");
    } finally {
      setIsCopying(false);
    }
  };

  return {
    expense,
    loading,
    isEditMode,
    editedTitle,
    setEditedTitle,
    editedAmount,
    setEditedAmount,
    editedCurrency,
    setEditedCurrency,
    editedDate,
    setEditedDate,
    editedPaidBy,
    setEditedPaidBy,
    isDeleting,
    isCopying,
    handleEditClick,
    handleCancelEdit,
    handleSaveClick,
    handleDeleteClick,
    handleCopyToClipboard
  };
};
