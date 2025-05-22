import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts';
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import AppLayout from '@/layouts/AppLayout';
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.number(),
  currency: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  paidBy: z.string(),
  splitEqually: z.boolean().default(true),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      notes: '',
      paidBy: user?.id || '',
      splitEqually: true,
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const groupIdParam = urlParams.get('groupId');
    if (groupIdParam) {
      setGroupId(groupIdParam);
    }
  }, []);

  useEffect(() => {
    const fetchExpense = async () => {
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            console.error("Error fetching expense:", error);
            toast.error("Failed to load expense.");
          } else {
            setExpense(data);
            const initialValues = {
              title: data?.title || '',
              amount: data?.amount || 0,
              currency: data?.currency || 'USD',
              date: data?.date ? new Date(data.date) : new Date(),
              notes: data?.leftover_notes || '',
              paidBy: data?.paid_by || user?.id || '',
              splitEqually: true,
            };
            form.reset(initialValues);
          }
        } catch (error) {
          console.error("Error fetching expense:", error);
          toast.error("Failed to load expense.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users.");
        } else {
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    fetchExpense();
    fetchUsers();
  }, [id, user]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setLoading(true);
    try {
      const amountNumber = parseFloat(values.amount.toString());

      if (isNaN(amountNumber)) {
        toast.error("Invalid amount entered.");
        return;
      }

      const expenseData = {
        title: values.title,
        amount: amountNumber,
        currency: values.currency,
        date: values.date.toISOString(),
        leftover_notes: values.notes,
        paid_by: values.paidBy,
        group_id: groupId,
      };

      let response;
      if (id) {
        response = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id);
      } else {
        response = await supabase
          .from('expenses')
          .insert([expenseData]);
      }

      if (response.error) {
        console.error("Error saving expense:", response.error);
        toast.error("Failed to save expense.");
      } else {
        toast.success("Expense saved successfully!");
        navigate(groupId ? `/group/${groupId}` : '/');
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit Expense" : "New Expense"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Expense title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          type="number"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          className={cn(
                            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          )}
                          onSelect={field.onChange}
                          defaultValue={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this expense"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any additional notes or details about this expense.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        Saving...
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Save Expense"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExpenseForm;
