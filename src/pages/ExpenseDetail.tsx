import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CheckCircle, ChevronsUpDown, Copy, Loader2, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts'; // Updated import
import { useExpenseUsers } from '@/hooks/useExpenseUsers';

type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  group_name?: string | null;
};

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
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
  const { user } = useAuth();
  const { expenseUsers, isLoading: isUsersLoading } = useExpenseUsers();

  useEffect(() => {
    if (!id) {
      console.error("Expense ID is missing");
      return;
    }

    const fetchExpense = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setExpense(data);
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
      navigate('/');
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
      const expenseText = `Expense: ${expense.title}\nAmount: ${expense.amount} ${expense.currency}\nDate: ${new Date(expense.date).toLocaleDateString()}`;
      await navigator.clipboard.writeText(expenseText);
      toast.success("Expense details copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy expense details to clipboard.");
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <CardTitle>Expense Not Found</CardTitle>
            <CardDescription>The requested expense could not be found.</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Expense' : expense.title}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update the expense details' : 'View and manage expense details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode ? (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={editedCurrency} onValueChange={setEditedCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <DatePicker
                  date={editedDate}
                  onDateChange={setEditedDate}
                />
              </div>
              <div>
                <Label htmlFor="paidBy">Paid By</Label>
                <Select value={editedPaidBy} onValueChange={setEditedPaidBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveClick} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Title</p>
                <p className="text-muted-foreground">{expense.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Amount</p>
                <p className="text-muted-foreground">
                  {Number(expense.amount).toFixed(2)} {expense.currency}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Date</p>
                <p className="text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Paid By</p>
                <p className="text-muted-foreground">{expense.paid_by}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCopyToClipboard} disabled={isCopying}>
                  {isCopying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copy
                </Button>
                <Button onClick={handleEditClick}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseDetail;
