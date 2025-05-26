import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useBalances } from '@/hooks/useBalances';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { BalanceSummaryCards } from '@/components/balances/BalanceSummaryCards';
import { SimplifiedPayments } from '@/components/balances/SimplifiedPayments';
import { LoadingCenter } from '@/components/ui/loading';

interface BalancesTabProps {
  groupId: string;
}

export const BalancesTab = ({ groupId }: BalancesTabProps) => {
  const { balances, loading, error, refreshing, handleRefresh } = useBalances();
  
  const balanceData: BalanceData[] = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name || balance.user_email,
    amountPaid: balance.amount > 0 ? balance.amount : 0,
    amountOwed: balance.amount < 0 ? Math.abs(balance.amount) : 0,
    netBalance: balance.amount
  }));

  React.useEffect(() => {
    if (!refreshing && !loading) {
      handleRefresh();
    }
  }, [groupId]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingCenter />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-red-500">
            Error loading balance data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">
            No balance data available yet. Create some expenses to see balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <BalanceSummaryCards balances={balanceData} groupId={groupId} />
      <SimplifiedPayments balances={balanceData} />
      <BalancesTable balances={balanceData} />
    </>
  );
};
