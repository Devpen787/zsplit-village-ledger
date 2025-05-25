
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { BalanceData } from '@/components/balances/BalancesTable';
import { formatCurrency } from '@/utils/money';
import { calculateOptimalSettlements } from '@/utils/settlementUtils';
import { useMemo } from 'react';

interface BalancePaymentSuggestionsProps {
  balances: BalanceData[];
}

export const BalancePaymentSuggestions = ({ balances }: BalancePaymentSuggestionsProps) => {
  // Memoize settlement calculations for performance
  const suggestedPayments = useMemo(() => {
    try {
      return calculateOptimalSettlements(balances);
    } catch (error) {
      console.error('Error calculating payments:', error);
      return [];
    }
  }, [balances]);

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
                <span className="font-mono font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
