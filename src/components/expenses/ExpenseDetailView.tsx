
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { Expense } from '@/types/expenses';

interface ExpenseDetailViewProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  isDeleting: boolean;
  isCopying: boolean;
}

export const ExpenseDetailView = ({ 
  expense, 
  onEdit, 
  onDelete, 
  onCopy, 
  isDeleting, 
  isCopying 
}: ExpenseDetailViewProps) => {
  return (
    <>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Title</p>
        <p className="text-muted-foreground">{expense.title}</p>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Amount</p>
        <p className="text-muted-foreground">
          {Number(expense.amount).toFixed(2)} {expense.currency}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Date</p>
        <p className="text-muted-foreground">
          {new Date(expense.date).toLocaleDateString()}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Paid By</p>
        <p className="text-muted-foreground">{expense.paid_by}</p>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCopy} disabled={isCopying}>
          {isCopying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
          Copy
        </Button>
        <Button onClick={onEdit}>Edit</Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete
        </Button>
      </div>
    </>
  );
};
