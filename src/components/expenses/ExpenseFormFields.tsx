
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ExpenseFormValues } from '@/hooks/useExpenseForm';
import ExpenseBasicFields from './form-fields/ExpenseBasicFields';
import ExpensePayerField from './form-fields/ExpensePayerField';
import ExpenseNotesField from './form-fields/ExpenseNotesField';

interface ExpenseFormFieldsProps {
  form: UseFormReturn<ExpenseFormValues>;
  users: any[];
}

const ExpenseFormFields: React.FC<ExpenseFormFieldsProps> = ({ form, users }) => {
  return (
    <>
      {/* Basic expense information */}
      <ExpenseBasicFields form={form} />
      
      {/* Payer selection */}
      <ExpensePayerField form={form} users={users} />
      
      {/* Notes field */}
      <ExpenseNotesField form={form} />
    </>
  );
};

export default ExpenseFormFields;
