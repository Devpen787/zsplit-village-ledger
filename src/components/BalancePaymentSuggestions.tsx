
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { BalanceData } from '@/components/balances/BalancesTable';

type PaymentSuggestion = {
  fromUserId: string;
  fromUserName: string | null;
  toUserId: string;
  toUserName: string | null;
  amount: number;
};

interface BalancePaymentSuggestionsProps {
  balances: BalanceData[];
}

export const BalancePaymentSuggestions = ({ balances }: BalancePaymentSuggestionsProps) => {
  // Filter users who owe money and users who are owed money
  const debtors = balances
    .filter(balance => balance.netBalance < -0.01) // Small threshold to handle floating point errors
    .sort((a, b) => a.netBalance - b.netBalance); // Sort from largest debt to smallest
  
  const creditors = balances
    .filter(balance => balance.netBalance > 0.01) // Small threshold to handle floating point errors
    .sort((a, b) => b.netBalance - a.netBalance); // Sort from largest credit to smallest

  // Calculate the optimal payments to settle balances
  const calculateOptimalPayments = (): PaymentSuggestion[] => {
    const payments: PaymentSuggestion[] = [];
    
    // Create clones to work with
    const remainingDebtors = [...debtors];
    const remainingCreditors = [...creditors];
    
    while (remainingDebtors.length > 0 && remainingCreditors.length > 0) {
      const debtor = remainingDebtors[0];
      const creditor = remainingCreditors[0];
      
      // How much the debtor owes (make it positive for easier comparison)
      const debtAmount = Math.abs(debtor.netBalance);
      // How much the creditor is owed
      const creditAmount = creditor.netBalance;
      
      // The payment is the minimum of what's owed and what's due
      const paymentAmount = Math.min(debtAmount, creditAmount);
      
      if (paymentAmount > 0.01) { // Ignore tiny payments
        payments.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Number(paymentAmount.toFixed(2))
        });
      }
      
      // Update balances
      debtor.netBalance += paymentAmount;
      creditor.netBalance -= paymentAmount;
      
      // Remove users who have settled up
      if (Math.abs(debtor.netBalance) < 0.01) {
        remainingDebtors.shift();
      }
      
      if (Math.abs(creditor.netBalance) < 0.01) {
        remainingCreditors.shift();
      }
    }
    
    return payments;
  };

  const suggestedPayments = calculateOptimalPayments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suggested Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestedPayments.length === 0 ? (
          <p className="text-center text-muted-foreground">No payments needed. Everyone is settled up!</p>
        ) : (
          <div className="space-y-3">
            {suggestedPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{payment.fromUserName}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{payment.toUserName}</span>
                </div>
                <span className="font-mono font-semibold">{payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
