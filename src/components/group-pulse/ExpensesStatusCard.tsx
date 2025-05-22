
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from 'lucide-react';

interface ExpensesStatusCardProps {
  potBalance: number;
  loading: boolean;
}

export const ExpensesStatusCard = ({ potBalance, loading }: ExpensesStatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Expenses Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Paid: ${loading ? '...' : ((potBalance * 0.8).toFixed(2))}</span>
          <span>Unpaid: ${loading ? '...' : ((potBalance * 0.2).toFixed(2))}</span>
        </div>
        <Progress value={80} />
        <p className="text-sm text-muted-foreground">
          80% of expenses settled
        </p>
      </CardContent>
    </Card>
  );
};
