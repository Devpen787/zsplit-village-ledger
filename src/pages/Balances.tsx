
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useBalances } from '@/hooks/useBalances';
import { BalancesHeader } from '@/components/balances/BalancesHeader';
import { BalancesTable } from '@/components/balances/BalancesTable';
import { BalancePaymentSuggestions } from '@/components/BalancePaymentSuggestions';

const Balances = () => {
  const { balances, loading, error, refreshing, handleRefresh } = useBalances();

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

      <BalancesTable balances={balances} />
      <BalancePaymentSuggestions balances={balances} />
    </div>
  );
};

export default Balances;
