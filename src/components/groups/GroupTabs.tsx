
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, PiggyBank, BarChart3, Scale } from 'lucide-react';
import { useExpenses } from "@/hooks/adapters/useExpenses";
import { ExpensesList } from '@/components/ExpensesList';
import { SimpleMembersCard } from './SimpleMembersCard';
import { GroupPotTab } from './tabs/GroupPotTab';
import { GroupPulseTab } from './tabs/GroupPulseTab';
import { BalancesTab } from './tabs/BalancesTab';

interface GroupTabsProps {
  groupId: string;
  isAdmin?: boolean;
}

export const GroupTabs = ({ groupId, isAdmin }: GroupTabsProps) => {
  const { expenses, loading } = useExpenses(undefined, groupId);

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="expenses" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Expenses</span>
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </TabsTrigger>
        <TabsTrigger value="pot" className="flex items-center gap-2">
          <PiggyBank className="h-4 w-4" />
          <span className="hidden sm:inline">Pot</span>
        </TabsTrigger>
        <TabsTrigger value="pulse" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Pulse</span>
        </TabsTrigger>
        <TabsTrigger value="balances" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span className="hidden sm:inline">Balances</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="expenses" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesList groupId={groupId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members" className="mt-6">
        <SimpleMembersCard groupId={groupId} isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="pot" className="mt-6">
        <GroupPotTab groupId={groupId} />
      </TabsContent>

      <TabsContent value="pulse" className="mt-6">
        <GroupPulseTab groupId={groupId} />
      </TabsContent>

      <TabsContent value="balances" className="mt-6">
        <BalancesTab groupId={groupId} />
      </TabsContent>
    </Tabs>
  );
};
