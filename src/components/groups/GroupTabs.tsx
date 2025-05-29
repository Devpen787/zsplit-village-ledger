
import React, { Dispatch, SetStateAction } from 'react';
import { Tabs } from "@/components/ui/tabs";
import { GroupMember } from '@/types/supabase';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { useExpenses } from '@/hooks/useExpenses';
import { GroupTabNav } from './tabs/GroupTabNav';
import { GroupTabContent } from './tabs/GroupTabContent';

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
  // Get group pulse data for metrics
  const { 
    potBalance = 0, 
    pendingPayoutsCount = 0, 
    connectedWalletsCount = 0 
  } = useGroupPulse(groupId);
  
  // Get expenses data for metrics
  const { expenses } = useExpenses(undefined, groupId);
  
  // Calculate total expenses - fixed to use reduce with proper typing
  const totalExpenses = expenses.reduce((sum: number, expense) => {
    return sum + Number(expense.amount || 0);
  }, 0);

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <GroupTabNav />
      <GroupTabContent
        activeTab={activeTab}
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
    </Tabs>
  );
};
