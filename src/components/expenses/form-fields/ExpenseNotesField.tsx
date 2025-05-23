
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { ExpenseFormValues } from '@/hooks/useExpenseForm';
import { Textarea } from "@/components/ui/textarea";

interface ExpenseNotesFieldProps {
  form: UseFormReturn<ExpenseFormValues>;
}

const ExpenseNotesField: React.FC<ExpenseNotesFieldProps> = ({ form }) => {
  return (
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
  );
};

export default ExpenseNotesField;
