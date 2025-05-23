
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Crown } from 'lucide-react';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useAuth } from '@/contexts';

interface GroupPotSummaryHeaderProps {
  groupId: string;
  totalContributions: number;
  remainingBalance: number;
  targetAmount: number;
  isAdmin: boolean;
}

export const GroupPotSummaryHeader = ({ 
  groupId, 
  totalContributions, 
  remainingBalance, 
  targetAmount,
  isAdmin 
}: GroupPotSummaryHeaderProps) => {
  const { user } = useAuth();
  const { group } = useGroupDetails(groupId, user);

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <PiggyBank className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Group Pot{group?.name ? ` - ${group.name}` : ''}</CardTitle>
                <CardDescription>Manage and view funds for group expenses</CardDescription>
              </div>
              
              {isAdmin && (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                  <Crown className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
              <p className="text-2xl font-bold">CHF {totalContributions.toFixed(2)}</p>
            </div>
            
            <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
              <p className="text-2xl font-bold">CHF {remainingBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">After approved payouts</p>
            </div>
            
            <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
              <p className="text-2xl font-bold">CHF {targetAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
