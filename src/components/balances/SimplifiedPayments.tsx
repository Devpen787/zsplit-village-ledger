
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CreditCard, Users, TrendingDown, CheckCircle } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { simplifyDebts, getMyDebts, calculateSavings, SimplifiedDebt } from '@/utils/debtSimplificationUtils';
import { toast } from '@/components/ui/sonner';

interface SimplifiedPaymentsProps {
  balances: BalanceData[];
  onMarkAsPaid?: (debt: SimplifiedDebt) => void;
}

export const SimplifiedPayments = ({ balances, onMarkAsPaid }: SimplifiedPaymentsProps) => {
  const { user } = useAuth();
  const paymentSuggestion = simplifyDebts(balances);
  const { iOwe, owedToMe } = getMyDebts(paymentSuggestion.debts, user?.id || '');
  
  // Calculate what the original number of transactions would be
  const originalTransactions = balances.filter(b => Math.abs(b.netBalance) > 0.01).length;
  const savings = calculateSavings(originalTransactions, paymentSuggestion.totalTransactions);

  const handlePayment = (debt: SimplifiedDebt) => {
    toast.success(`Payment of ${formatCurrency(debt.amount)} to ${debt.toUserName} marked as sent!`);
    onMarkAsPaid?.(debt);
  };

  const handleRequestPayment = (debt: SimplifiedDebt) => {
    toast.info(`Payment request sent to ${debt.fromUserName} for ${formatCurrency(debt.amount)}`);
  };

  if (!paymentSuggestion.canSimplify) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            All Settled Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            🎉 Everyone's accounts are balanced. No payments needed!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simplification Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-500" />
            Simplified Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{paymentSuggestion.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{savings.transactionsSaved}</div>
              <div className="text-sm text-muted-foreground">Payments Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(paymentSuggestion.totalAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
          </div>
          {savings.transactionsSaved > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                💡 Smart routing saves {savings.transactionsSaved} payment{savings.transactionsSaved > 1 ? 's' : ''} 
                ({savings.percentageSaved}% fewer transactions)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Payments - What I Need to Pay */}
      {iOwe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              You Need to Pay ({iOwe.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {iOwe.map((debt, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">You</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{debt.toUserName}</span>
                    </div>
                    <Badge variant={debt.priority === 'high' ? 'destructive' : debt.priority === 'medium' ? 'default' : 'outline'}>
                      {formatCurrency(debt.amount)}
                    </Badge>
                    {debt.priority === 'high' && (
                      <Badge variant="outline" className="text-xs">High Priority</Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handlePayment(debt)}
                    className="flex items-center gap-1"
                  >
                    <CreditCard className="h-3 w-3" />
                    Pay Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Receivables - What I'm Owed */}
      {owedToMe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              You Will Receive ({owedToMe.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {owedToMe.map((debt, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{debt.fromUserName}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">You</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      {formatCurrency(debt.amount)}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRequestPayment(debt)}
                    className="flex items-center gap-1"
                  >
                    Request Payment
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show message if no personal debts but others exist */}
      {iOwe.length === 0 && owedToMe.length === 0 && paymentSuggestion.debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              You're All Set!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">
              You don't have any payments to make or receive, but there are other payments in your group.
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Other Payments in Group */}
      {paymentSuggestion.debts.filter(d => d.fromUserId !== user?.id && d.toUserId !== user?.id).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Other Group Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentSuggestion.debts
                .filter(d => d.fromUserId !== user?.id && d.toUserId !== user?.id)
                .map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{debt.fromUserName}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{debt.toUserName}</span>
                    </div>
                    <Badge variant="outline">{formatCurrency(debt.amount)}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
