
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ExpensesList } from "@/components/ExpensesList";
import { GroupMember } from '@/types/supabase';
import { useBalances } from '@/hooks/useBalances';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { SettlementActions } from '@/components/balances/settlements/SettlementActions';
import { BalanceSummaryCards } from '@/components/balances/BalanceSummaryCards';
import { Loader2 } from 'lucide-react';
import { GroupPot } from '@/components/group-pot/GroupPot';
import { GroupPulse } from '@/components/group-pulse/GroupPulse';
import { GroupOverview } from './GroupOverview';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { useExpenses } from '@/hooks/useExpenses';
import { Dispatch, SetStateAction } from 'react';

interface GroupTabsProps {
  groupId: string;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUser?: {
    id: string;
  } | null;
  group?: {
    name: string;
    icon: string;
    created_at: string;
  } | null;
  activeTab?: string;
  onTabChange?: Dispatch<SetStateAction<string>>;
}

export const GroupTabs = ({ 
  groupId, 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUser,
  group,
  activeTab = "overview",
  onTabChange
}: GroupTabsProps) => {
  // Get balance data
  const { balances, loading, error, refreshing, handleRefresh } = useBalances();
  
  // Get group pulse data for metrics
  const { 
    potBalance, 
    pendingPayoutsCount, 
    connectedWalletsCount 
  } = useGroupPulse(groupId);
  
  // Get expenses data for metrics
  const { expenses } = useExpenses(undefined, groupId);
  
  // Transform Balance[] to BalanceData[]
  const balanceData: BalanceData[] = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name || balance.user_email,
    amountPaid: balance.amount > 0 ? balance.amount : 0,
    amountOwed: balance.amount < 0 ? Math.abs(balance.amount) : 0,
    netBalance: balance.amount
  }));

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Auto-refresh balances when component mounts
  useEffect(() => {
    if (!refreshing && !loading) {
      handleRefresh();
    }
  }, [groupId]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        <TabsTrigger value="group-pot">Group Pot</TabsTrigger>
        <TabsTrigger value="group-pulse">Group Pulse</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <GroupOverview 
          groupId={groupId}
          group={group}
          members={members}
          isAdmin={isAdmin}
          onInviteClick={onInviteClick}
          currentUserId={currentUser?.id}
          potBalance={potBalance}
          totalExpenses={totalExpenses}
          pendingPayoutsCount={pendingPayoutsCount}
          connectedWalletsCount={connectedWalletsCount}
        />
      </TabsContent>
      <TabsContent value="expenses" className="mt-4">
        <ExpensesList groupId={groupId} />
      </TabsContent>
      <TabsContent value="balances" className="mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
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
        ) : balances.length === 0 ? (
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
        ) : (
          <>
            <BalanceSummaryCards balances={balanceData} groupId={groupId} />
            <BalancesTable balances={balanceData} />
            <SettlementActions balances={balanceData} />
          </>
        )}
      </TabsContent>
      <TabsContent value="group-pot" className="mt-4">
        <GroupPot groupId={groupId} />
      </TabsContent>
      <TabsContent value="group-pulse" className="mt-4">
        <GroupPulse groupId={groupId} />
      </TabsContent>
    </Tabs>
  );
};
