
import { useState } from 'react';
import { usePulseActivities } from './group-pulse/usePulseActivities';
import { usePulseAdmin } from './group-pulse/usePulseAdmin';
import { usePulsePayouts } from './group-pulse/usePulsePayouts';
import { useGroupConnectivity } from './group-pulse/useGroupConnectivity';
import { PotActivity } from '@/types/group-pot';
import { useExpenses } from './useExpenses';
import { useCrossGroupStats, AllGroupsStats } from './group-pulse/useCrossGroupStats';
import { useGroupsList } from './useGroupsList';
import { useGroupStatistics } from './group-pulse/useGroupStatistics';

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
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  averageApprovalTime: string;
  allGroupsStats: AllGroupsStats | null;
}

export const useGroupPulse = (groupId: string): GroupPulseData => {
  const { 
    activities,
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
  
  // Get cross-group statistics
  const { groups } = useGroupsList();
  const { allGroupsStats } = useCrossGroupStats(groups);
  
  // Calculate total expenses
  const totalExpenses = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  
  // Get group statistics using our new hook
  const {
    potBalance,
    pendingPayoutsCount,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    averageApprovalTime
  } = useGroupStatistics(activities, expenses);
  
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
    loading,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    averageApprovalTime,
    allGroupsStats
  };
};
