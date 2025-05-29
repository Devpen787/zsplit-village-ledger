
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MembersCard } from './MembersCard';
import { GroupManagementPanel } from './GroupManagementPanel';
import { InvitationManagementPanel } from './InvitationManagementPanel';
import { ExpensesTab } from './tabs/ExpensesTab';
import { BalancesTab } from './tabs/BalancesTab';
import { GroupPotTab } from './tabs/GroupPotTab';
import { GroupPulseTab } from './tabs/GroupPulseTab';
import { GroupMember, Group } from '@/types/supabase';
import { User } from '@/types/auth';

interface GroupTabsProps {
  groupId: string;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUser: User | null;
  group: Group;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const GroupTabs = ({
  groupId,
  members,
  isAdmin,
  onInviteClick,
  currentUser,
  group,
  activeTab,
  onTabChange
}: GroupTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        <TabsTrigger value="pot">Group Pot</TabsTrigger>
        <TabsTrigger value="pulse">Pulse</TabsTrigger>
      </TabsList>

      <TabsContent value="members" className="space-y-6">
        <MembersCard
          members={members}
          isAdmin={isAdmin}
          onInviteClick={onInviteClick}
          currentUserId={currentUser?.id}
        />
        
        <InvitationManagementPanel
          groupId={groupId}
          isAdmin={isAdmin}
          onInviteClick={onInviteClick}
        />
        
        <GroupManagementPanel
          groupId={groupId}
          members={members}
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
          onMemberUpdate={() => {}}
        />
      </TabsContent>

      <TabsContent value="expenses">
        <ExpensesTab groupId={groupId} />
      </TabsContent>

      <TabsContent value="balances">
        <BalancesTab groupId={groupId} />
      </TabsContent>

      <TabsContent value="pot">
        <GroupPotTab groupId={groupId} />
      </TabsContent>

      <TabsContent value="pulse">
        <GroupPulseTab groupId={groupId} />
      </TabsContent>
    </Tabs>
  );
};
