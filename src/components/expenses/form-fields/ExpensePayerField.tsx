
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ExpenseFormValues } from '@/hooks/useExpenseForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseUser } from '@/types/expenses';

interface ExpensePayerFieldProps {
  form: UseFormReturn<ExpenseFormValues>;
  users: ExpenseUser[];
}

const ExpensePayerField: React.FC<ExpensePayerFieldProps> = ({ form, users }) => {
  return (
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
  );
};

export default ExpensePayerField;
