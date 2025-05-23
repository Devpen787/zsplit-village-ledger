
import { useState } from 'react';
import { usePulseActivities } from './group-pulse/usePulseActivities';
import { usePulseAdmin } from './group-pulse/usePulseAdmin';
import { usePulsePayouts } from './group-pulse/usePulsePayouts';
import { useGroupConnectivity } from './group-pulse/useGroupConnectivity';
import { PotActivity } from '@/types/group-pot';
import { useExpenses } from './useExpenses';

interface GroupPulseData {
  potBalance: number;
  pendingPayoutsCount: number;
  connectedWalletsCount: number;
  totalMembersCount: number;
  pendingRequests: PotActivity[];
  recentActivities: PotActivity[];
  totalExpenses: number;
  isAdmin: boolean;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
  loading: boolean;
}

export const useGroupPulse = (groupId: string): GroupPulseData => {
  const { 
    potBalance, 
    pendingRequests,
    recentActivities,
    loading,
    setActivities,
    setPendingRequests
  } = usePulseActivities(groupId);
  
  const { isAdmin } = usePulseAdmin(groupId);
  
  const { handleApproveRequest, handleRejectRequest } = 
    usePulsePayouts(groupId, setActivities, pendingRequests, setPendingRequests);
  
  const { connectedWalletsCount, totalMembersCount } = useGroupConnectivity(groupId);
  
  // Get expenses data for statistics
  const { expenses } = useExpenses(undefined, groupId);
  
  // Calculate total expenses
  const totalExpenses = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  
  // Pending payouts count
  const pendingPayoutsCount = pendingRequests.length;
  
  return {
    potBalance,
    pendingPayoutsCount,
    connectedWalletsCount,
    totalMembersCount,
    pendingRequests,
    recentActivities,
    totalExpenses,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest,
    loading
  };
};
