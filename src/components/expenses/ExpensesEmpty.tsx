
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ExpensesEmptyProps {
  onCreateExpense: () => void;
}

export const ExpensesEmpty = ({ onCreateExpense }: ExpensesEmptyProps) => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-3 py-4">
          <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center">
            <PlusCircle className="h-6 w-6 text-secondary-foreground" />
          </div>
          <h3 className="font-medium">No expenses yet</h3>
          <p className="text-sm text-muted-foreground">
            Add your first expense to start tracking
          </p>
          <Button onClick={onCreateExpense} className="mt-2">
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
