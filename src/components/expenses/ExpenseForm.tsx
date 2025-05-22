
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { expenseFormSchema, useExpenseForm, ExpenseFormValues } from '@/hooks/useExpenseForm';
import ExpenseFormFields from './ExpenseFormFields';
import ExpenseFormHeader from './ExpenseFormHeader';
import ExpenseFormSubmitButton from './ExpenseFormSubmitButton';

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
      <ExpenseFormHeader isEditing={isEditing} />
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ExpenseFormFields form={form} users={users} />
              <ExpenseFormSubmitButton loading={submitLoading} isEditing={isEditing} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;
