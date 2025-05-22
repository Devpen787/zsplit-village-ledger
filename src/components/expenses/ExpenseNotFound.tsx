
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export const ExpenseNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="p-6">
          <CardTitle>Expense Not Found</CardTitle>
          <CardDescription>The requested expense could not be found.</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
