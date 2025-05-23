
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, PlusCircle } from "lucide-react";

interface ExpensesEmptyProps {
  onCreateExpense: () => void;
  groupContext?: boolean;
}

export const ExpensesEmpty = ({ onCreateExpense, groupContext = false }: ExpensesEmptyProps) => {
  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <Receipt className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No expenses yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {groupContext 
            ? "Your group doesn't have any expenses recorded yet." 
            : "You don't have any expenses recorded yet."}
        </p>
        <Button onClick={onCreateExpense}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add First Expense
        </Button>
      </CardContent>
    </Card>
  );
};
