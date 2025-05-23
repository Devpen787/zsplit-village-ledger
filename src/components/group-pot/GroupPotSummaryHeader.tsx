
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TargetAmountInput } from './TargetAmountInput';
import { PiggyBank, CreditCard, ArrowDownCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const totalPayouts = totalContributions - remainingBalance;
  const progressPercentage = targetAmount > 0 
    ? Math.min(100, (totalContributions / targetAmount) * 100)
    : 0;
    
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <PiggyBank className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Group Pot Summary</CardTitle>
            <CardDescription>Manage and track your group's shared funds</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Contributions */}
          <div className="flex items-center gap-3 border rounded-lg p-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
              <p className="text-xl font-bold">CHF {totalContributions.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Sum of all deposits</p>
            </div>
          </div>
          
          {/* Total Payouts */}
          <div className="flex items-center gap-3 border rounded-lg p-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <ArrowDownCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
              <p className="text-xl font-bold">CHF {totalPayouts.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Amount paid out to members</p>
            </div>
          </div>
          
          {/* Remaining Balance */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 border rounded-lg p-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                    <p className="text-xl font-bold text-primary">CHF {remainingBalance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Available after approved payouts</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is your available group pot after approved payouts.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Target amount and progress section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Target amount:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">
                CHF {targetAmount.toFixed(2)}
              </span>
              {isAdmin && <TargetAmountInput currentTarget={targetAmount} />}
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progressPercentage.toFixed(0)}% funded
                (CHF {totalContributions.toFixed(2)} of CHF {targetAmount.toFixed(2)})
              </span>
              <span>
                Remaining: CHF {Math.max(0, targetAmount - totalContributions).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
