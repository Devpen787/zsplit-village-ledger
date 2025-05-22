
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { expenseFormSchema, useExpenseForm, ExpenseFormValues } from '@/hooks/useExpenseForm';
import ExpenseFormFields from './ExpenseFormFields';

interface ExpenseFormProps {
  groupId: string | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const {
    loading,
    submitLoading,
    getDefaultValues,
    onSubmit,
    users,
    isEditing
  } = useExpenseForm(groupId);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getDefaultValues(),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Expense" : "New Expense"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ExpenseFormFields form={form} users={users} />
              
              <div>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? (
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
  );
};

export default ExpenseForm;
