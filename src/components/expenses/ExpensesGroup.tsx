
import React from 'react';
import { ExpenseCard } from './ExpenseCard';
import { formatDateForDisplay } from '@/utils/expenseUtils';
import { Expense } from '@/types/expenses';
import { Badge } from '@/components/ui/badge';

interface ExpensesGroupProps {
  date: string;
  expenses: Expense[];
}

export const ExpensesGroup = ({ date, expenses }: ExpensesGroupProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <Badge variant="outline" className="mr-2 bg-background">
          {formatDateForDisplay(date)}
        </Badge>
        <div className="h-px flex-1 bg-border"></div>
      </div>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
};
