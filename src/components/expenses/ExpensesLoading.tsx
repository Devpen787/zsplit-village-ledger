
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const ExpensesLoading = () => {
  return (
    <Card>
      <CardContent className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
};
