
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useBalances } from '@/hooks/useBalances';
import { BalancesHeader } from '@/components/balances/BalancesHeader';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { BalancePaymentSuggestions } from '@/components/BalancePaymentSuggestions';

const Balances = () => {
  const { balances, loading, error, refreshing, handleRefresh } = useBalances();

  // Transform Balance[] to BalanceData[]
  const balanceData: BalanceData[] = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name || balance.user_email,
    amountPaid: balance.amount > 0 ? balance.amount : 0,
    amountOwed: balance.amount < 0 ? Math.abs(balance.amount) : 0,
    netBalance: balance.amount
  }));

  if (loading && !refreshing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <BalancesHeader refreshing={refreshing} onRefresh={handleRefresh} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <BalancesTable balances={balanceData} />
      <BalancePaymentSuggestions balances={balanceData} />
    </div>
  );
};

export default Balances;
