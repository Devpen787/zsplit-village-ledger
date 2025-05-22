
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from 'lucide-react';

interface PotHealthCardProps {
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
}

export const PotHealthCard = ({ 
  averagePayoutSize, 
  estimatedPayoutsRemaining 
}: PotHealthCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Pot Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Average Payout</p>
            <p className="text-2xl font-medium">${averagePayoutSize.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payouts Remaining</p>
            <p className="text-2xl font-medium">{estimatedPayoutsRemaining.toFixed(1)}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on current pot balance and average payout history
        </p>
      </CardContent>
    </Card>
  );
};
