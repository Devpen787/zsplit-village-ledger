
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Trash2, Edit, Users } from "lucide-react";
import { Expense } from '@/types/expenses';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const goToGroup = () => {
    if (expense.group_id) {
      navigate(`/group/${expense.group_id}`);
    }
  };

  // Determine the best name to display for the user who paid
  const getPaidByDisplayName = () => {
    if (expense.paid_by_user) {
      // Prioritize display_name if available, then name, then fall back to email
      return expense.paid_by_user.display_name || 
             expense.paid_by_user.name || 
             expense.paid_by_user.email || 
             expense.paid_by;
    }
    return expense.paid_by; // Fall back to the ID if no user info
  };

  return (
    <div className="space-y-6">
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
        <p className="text-muted-foreground">{getPaidByDisplayName()}</p>
      </div>
      
      {expense.group_id && (
        <div className="space-y-2">
          <p className="text-lg font-semibold">Group</p>
          <div className="flex items-center">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={goToGroup}>
              {expense.group_name || "View Group"}
              <Users className="ml-1 h-3 w-3" />
            </Badge>
          </div>
        </div>
      )}
      
      {expense.leftover_notes && (
        <div className="space-y-2">
          <p className="text-lg font-semibold">Notes</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{expense.leftover_notes}</p>
        </div>
      )}
      
      <div className="border-t pt-4 mt-6">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCopy} disabled={isCopying}>
            {isCopying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy
          </Button>
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
