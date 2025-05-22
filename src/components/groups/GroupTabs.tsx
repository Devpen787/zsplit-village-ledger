
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ExpensesList } from "@/components/ExpensesList";
import { MembersList } from "@/components/groups/MembersList";
import { GroupMember } from '@/types/supabase';
import { useBalances } from '@/hooks/useBalances';
import { BalancesTable, BalanceData } from '@/components/balances/BalancesTable';
import { SettlementActions } from '@/components/balances/settlements/SettlementActions';
import { BalanceSummaryCards } from '@/components/balances/BalanceSummaryCards';
import { Loader2 } from 'lucide-react';
import { GroupPot } from '@/components/group-pot/GroupPot';

interface GroupTabsProps {
  groupId: string;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUser?: {
    id: string;
  } | null;
}

export const GroupTabs = ({ 
  groupId, 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUser 
}: GroupTabsProps) => {
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
  useEffect(() => {
    if (!refreshing && !loading) {
      handleRefresh();
    }
  }, [groupId]);

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        <TabsTrigger value="group-pot">Group Pot</TabsTrigger>
        <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
      </TabsList>
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
      <TabsContent value="members" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MembersList
              members={members}
              isAdmin={isAdmin}
              onInviteClick={onInviteClick}
              currentUserId={currentUser?.id}
              displayStyle="grid"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
