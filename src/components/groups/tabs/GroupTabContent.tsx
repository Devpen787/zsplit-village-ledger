
import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { GroupOverview } from '@/components/groups/GroupOverview';
import { ExpensesTab } from './ExpensesTab';
import { BalancesTab } from './BalancesTab';
import { GroupPotTab } from './GroupPotTab';
import { GroupPulseTab } from './GroupPulseTab';
import { GroupMember } from '@/types/supabase';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
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
      {!isMobile && (
        <>
          <TabsContent value="group-pot" className="mt-4">
            <GroupPotTab groupId={groupId} />
          </TabsContent>
          <TabsContent value="group-pulse" className="mt-4">
            <GroupPulseTab groupId={groupId} />
          </TabsContent>
        </>
      )}
      {isMobile && (
        <TabsContent value="more" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/group-pot/${groupId}`)}
              className="flex flex-col items-center justify-center h-24 text-center p-3"
            >
              <span className="text-lg mb-2">Group Pot</span>
              <span className="text-sm text-muted-foreground">Manage group funds</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/group-pulse/${groupId}`)}
              className="flex flex-col items-center justify-center h-24 text-center p-3"
            >
              <span className="text-lg mb-2">Group Pulse</span>
              <span className="text-sm text-muted-foreground">Group analytics</span>
            </Button>
          </div>
        </TabsContent>
      )}
    </>
  );
};
