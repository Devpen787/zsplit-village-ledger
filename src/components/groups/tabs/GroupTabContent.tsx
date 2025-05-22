
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { GroupOverview } from '@/components/groups/GroupOverview';
import { ExpensesTab } from './ExpensesTab';
import { BalancesTab } from './BalancesTab';
import { GroupPotTab } from './GroupPotTab';
import { GroupPulseTab } from './GroupPulseTab';
import { GroupMember } from '@/types/supabase';

interface GroupTabContentProps {
  activeTab: string;
  groupId: string;
  group?: {
    name: string;
    icon: string;
    created_at: string;
  } | null;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  potBalance: number;
  totalExpenses: number;
  pendingPayoutsCount: number;
  connectedWalletsCount: number;
}

export const GroupTabContent: React.FC<GroupTabContentProps> = ({
  activeTab,
  groupId,
  group,
  members,
  isAdmin,
  onInviteClick,
  currentUserId,
  potBalance,
  totalExpenses,
  pendingPayoutsCount,
  connectedWalletsCount
}) => {
  return (
    <>
      <TabsContent value="overview" className="mt-4">
        <GroupOverview 
          groupId={groupId}
          group={group}
          members={members}
          isAdmin={isAdmin}
          onInviteClick={onInviteClick}
          currentUserId={currentUserId}
          potBalance={potBalance}
          totalExpenses={totalExpenses}
          pendingPayoutsCount={pendingPayoutsCount}
          connectedWalletsCount={connectedWalletsCount}
        />
      </TabsContent>
      <TabsContent value="expenses" className="mt-4">
        <ExpensesTab groupId={groupId} />
      </TabsContent>
      <TabsContent value="balances" className="mt-4">
        <BalancesTab groupId={groupId} />
      </TabsContent>
      <TabsContent value="group-pot" className="mt-4">
        <GroupPotTab groupId={groupId} />
      </TabsContent>
      <TabsContent value="group-pulse" className="mt-4">
        <GroupPulseTab groupId={groupId} />
      </TabsContent>
    </>
  );
};
