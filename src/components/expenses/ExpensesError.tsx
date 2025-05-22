
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ExpensesErrorProps {
  error: string;
  hasRecursionError: boolean;
  onTryAgain: () => void;
  onCreateExpense: () => void;
}

export const ExpensesError = ({ 
  error, 
  hasRecursionError, 
  onTryAgain, 
  onCreateExpense 
}: ExpensesErrorProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {hasRecursionError ? "Database Configuration Issue" : "Error loading expenses"}
          </AlertTitle>
          <AlertDescription>
            {hasRecursionError ? (
              <>
                <p className="mb-2">We're experiencing a temporary database issue. This will be resolved soon.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  The database has a policy configuration that needs to be updated by administrators.
                </p>
              </>
            ) : (
              error
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={onTryAgain} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={onCreateExpense}>
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
