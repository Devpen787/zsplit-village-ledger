
import React from 'react';
import { ExpensesList } from "@/components/ExpensesList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExpensesTabProps {
  groupId: string;
}

export const ExpensesTab = ({ groupId }: ExpensesTabProps) => {
  const navigate = useNavigate();
  
  const handleCreateExpense = () => {
    navigate(`/expenses/new?groupId=${groupId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">All Expenses</h2>
        <Button onClick={handleCreateExpense} className="hidden md:flex">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
      <ExpensesList groupId={groupId} />
    </div>
  );
};
