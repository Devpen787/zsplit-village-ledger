
import React, { useState } from 'react';
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
import ExpenseSplitMethodFields from './ExpenseSplitMethodFields';

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
    isEditing,
    groupName
  } = useExpenseForm(groupId);

  const [splitMethod, setSplitMethod] = useState<string>("equal");
  const [isSplitValid, setIsSplitValid] = useState<boolean>(true);
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Track form validity separately from React Hook Form
  const isFormValid = form.formState.isValid && isSplitValid;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pb-24">
      <ExpenseFormHeader isEditing={isEditing} groupName={groupName} />
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic expense information */}
              <ExpenseFormFields form={form} users={users} />
              
              {/* Consolidated split method and participant selection */}
              <ExpenseSplitMethodFields 
                users={users}
                splitMethod={splitMethod}
                setSplitMethod={setSplitMethod}
                totalAmount={form.watch('amount')}
                paidBy={form.watch('paidBy')}
                groupName={groupName}
                groupId={groupId}
                onSplitDataChange={(splitData) => {
                  form.setValue('splitData', splitData);
                  // Split is valid when we receive data from the component
                  setIsSplitValid(true);
                }}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Sticky buttons at the bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-background border-t p-4 z-10">
        <div className="container mx-auto flex justify-between">
          <button 
            type="button" 
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-gray-700 font-medium"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <ExpenseFormSubmitButton 
            loading={submitLoading} 
            isEditing={isEditing} 
            disabled={!isFormValid}
            onClick={() => form.handleSubmit(onSubmit)()}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
