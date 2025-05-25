
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/money';

interface PotBalanceCardProps {
  potBalance: number;
}

export const PotBalanceCard = ({ potBalance }: PotBalanceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Available Pot Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(potBalance)}</div>
        <p className="text-sm text-muted-foreground">Balance after approved payouts</p>
        {potBalance <= 0 && (
          <p className="text-sm text-destructive mt-2">
            Low balance. Consider adding funds to the group pot.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
