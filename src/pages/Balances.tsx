
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { useBalances } from '@/hooks/useBalances';
import { BalancesHeader } from '@/components/balances/BalancesHeader';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { BalanceSummaryCards } from '@/components/balances/BalanceSummaryCards';
import { SettlementActions } from '@/components/balances/settlements/SettlementActions';
import { DebtRelationships } from '@/components/balances/DebtRelationships';
import { PaymentTracker } from '@/components/balances/settlements/PaymentTracker';
import { ReminderSystem } from '@/components/balances/ReminderSystem';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSettlements } from '@/hooks/useSettlements';
import AppLayout from '@/layouts/AppLayout';
import { LoadingPage } from '@/components/ui/loading';

const Balances = () => {
  const { balances, loading, error, hasRecursionError, refreshing, handleRefresh } = useBalances();
  const navigate = useNavigate();

  // Transform Balance[] to BalanceData[] with correct owed values
  const balanceData: BalanceData[] = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name || balance.user_email,
    amountPaid: balance.amount > 0 ? balance.amount : 0,
    amountOwed: balance.amount < 0 ? Math.abs(balance.amount) : 0,
    netBalance: balance.amount
  }));

  const { 
    settlements,
    markAsSettled,
    undoSettlement
  } = useSettlements(balanceData);

  const handleSendReminder = (relationship: any) => {
    // In a real app, this would send an actual notification
    console.log('Sending reminder for relationship:', relationship);
  };

  if (loading && !refreshing) {
    return (
      <AppLayout>
        <LoadingPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <BalancesHeader refreshing={refreshing} onRefresh={handleRefresh} />

        {hasRecursionError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Configuration Issue</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>We're experiencing an issue with database policies that prevents loading balances.</p>
              <p className="text-sm">
                This is a temporary issue that administrators are aware of. The RLS policy for expenses and group_members may need to be updated.
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 mt-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                  Return to Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {balances.length === 0 && !error && !hasRecursionError ? (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>No balances found</AlertTitle>
            <AlertDescription>
              There are no expenses or balances to display yet.
            </AlertDescription>
          </Alert>
        ) : !hasRecursionError && (
          <>
            <BalanceSummaryCards balances={balanceData} />
            
            {/* Enhanced debt and settlement flow */}
            <DebtRelationships 
              balances={balanceData} 
              onSendReminder={handleSendReminder}
            />
            
            <PaymentTracker 
              settlements={settlements}
              onMarkAsSettled={markAsSettled}
              onUndoSettlement={undoSettlement}
            />
            
            <ReminderSystem balances={balanceData} />
            
            <BalancesTable balances={balanceData} />
            <SettlementActions balances={balanceData} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Balances;
