
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { getExpenseEmoji } from '@/utils/expenseUtils';
import { Expense } from '@/types/expenses';

interface ExpenseCardProps {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  return (
    <Link to={`/expenses/${expense.id}`} key={expense.id}>
      <Card className="hover:bg-secondary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {getExpenseEmoji(expense.title)}
              </div>
              <div>
                <h4 className="font-medium">{expense.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Paid by {expense.paid_by_user?.name || expense.paid_by_user?.email.split('@')[0] || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">
                {Number(expense.amount).toFixed(2)} {expense.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
