
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityCardProps {
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
}

export const RecentActivityCard = ({ 
  recentExpensesCount, 
  latestExpenseDate 
}: RecentActivityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Recent Expenses</p>
            <p className="text-2xl font-medium">{recentExpensesCount}</p>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Latest Expense</p>
            <p className="text-lg font-medium">
              {latestExpenseDate ? formatDistanceToNow(latestExpenseDate, { addSuffix: true }) : 'None'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
