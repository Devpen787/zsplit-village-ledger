
import React from 'react';
import { ExpenseCard } from './ExpenseCard';
import { formatDateForDisplay } from '@/utils/expenseUtils';
import { Expense } from '@/types/expenses';

interface ExpensesGroupProps {
  date: string;
  expenses: Expense[];
}

export const ExpensesGroup = ({ date, expenses }: ExpensesGroupProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-md font-medium text-muted-foreground mb-2">
        {formatDateForDisplay(date)}
      </h3>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
};
