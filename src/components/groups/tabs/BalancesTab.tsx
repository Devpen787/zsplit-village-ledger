
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useBalances } from '@/hooks/useBalances';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { SettlementActions } from '@/components/balances/settlements/SettlementActions';
import { BalanceSummaryCards } from '@/components/balances/BalanceSummaryCards';

interface BalancesTabProps {
  groupId: string;
}

export const BalancesTab = ({ groupId }: BalancesTabProps) => {
  // Get balance data
  const { balances, loading, error, refreshing, handleRefresh } = useBalances();
  
  // Transform Balance[] to BalanceData[]
  const balanceData: BalanceData[] = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name || balance.user_email,
    amountPaid: balance.amount > 0 ? balance.amount : 0,
    amountOwed: balance.amount < 0 ? Math.abs(balance.amount) : 0,
    netBalance: balance.amount
  }));

  // Auto-refresh balances when component mounts
  React.useEffect(() => {
    if (!refreshing && !loading) {
      handleRefresh();
    }
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <BalancesTable balances={balanceData} />
      <SettlementActions balances={balanceData} />
    </>
  );
};
