import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts"; // Updated import
import { useExpenseUsers } from '@/hooks/useExpenseUsers';

type Expense = {
  id?: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
};

const ExpenseForm = () => {
  const [expense, setExpense] = useState<Expense>({
    title: '',
    amount: 0,
    currency: 'CHF',
    date: new Date().toISOString(),
    paid_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { users, loading: usersLoading, error: usersError } = useExpenseUsers();

  useEffect(() => {
    if (!user) return;
    setExpense(prev => ({ ...prev, paid_by: user.id }));
  }, [user]);

  useEffect(() => {
    if (id) {
      fetchExpense(id);
    }
  }, [id]);

  const fetchExpense = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setExpense({
          title: data.title || '',
          amount: data.amount || 0,
          currency: data.currency || 'CHF',
          date: data.date || new Date().toISOString(),
          paid_by: data.paid_by || '',
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching expense",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      if (id) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expense)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Expense updated",
        });
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert(expense);

        if (error) throw error;

        toast({
          title: "Expense created",
        });
      }

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error saving expense",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {typeof usersError === 'string' ? usersError : 'Failed to load users'}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{id ? 'Edit Expense' : 'Add Expense'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={expense.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={expense.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={expense.currency} onValueChange={(value) => setExpense(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">CHF</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={expense.date ? new Date(expense.date) : undefined}
                onValueChange={(date) => {
                  if (date) {
                    setExpense(prev => ({ ...prev, date: date.toISOString() }));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="paid_by">Paid By</Label>
              <Select value={expense.paid_by} onValueChange={(value) => setExpense(prev => ({ ...prev, paid_by: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                id ? 'Update Expense' : 'Add Expense'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;
