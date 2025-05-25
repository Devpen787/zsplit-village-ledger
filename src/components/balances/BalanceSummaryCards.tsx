
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, CreditCard } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';

interface BalanceSummaryCardsProps {
  balances: BalanceData[];
  groupId?: string;
}

export const BalanceSummaryCards = ({ balances, groupId }: BalanceSummaryCardsProps) => {
  const { user } = useAuth();
  
  // Calculate total group expenses (sum of all positive amounts)
  const totalGroupExpenses = balances.reduce((sum, balance) => sum + balance.amountPaid, 0);
  
  // Find current user's balance
  const currentUserBalance = user ? balances.find(balance => balance.userId === user.id) : null;
  const netBalance = currentUserBalance?.netBalance || 0;
  const isOwed = netBalance > 0;
  const hasNegativeBalance = netBalance < 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* My Balance Card */}
      <Card className={`overflow-hidden ${isOwed ? 'border-green-500/30' : hasNegativeBalance ? 'border-red-500/30' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${isOwed ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : hasNegativeBalance ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {isOwed ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
              </div>
              <h3 className="font-medium text-lg">My Balance</h3>
            </div>
          </div>
          
          {currentUserBalance ? (
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${isOwed ? 'text-green-600 dark:text-green-400' : hasNegativeBalance ? 'text-red-600 dark:text-red-400' : ''}`}>
                {formatCurrency(Math.abs(netBalance))}
              </p>
              <p className="text-muted-foreground">
                {isOwed 
                  ? "You are owed"
                  : hasNegativeBalance 
                    ? "You owe" 
                    : "You're all settled up!"
                }
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No balance information available</p>
          )}
        </CardContent>
      </Card>
      
      {/* Total Group Expenses Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-lg">Total Group Expenses</h3>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold">{formatCurrency(totalGroupExpenses)}</p>
            <p className="text-muted-foreground">
              Total amount spent in this group
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
