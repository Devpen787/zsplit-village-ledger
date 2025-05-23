
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
  totalPayouts: number;
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

export const useGroupPulse = (groupId: string | undefined): GroupPulseData => {
  // Guard against undefined groupId to prevent issues
  if (!groupId) {
    // Return default values when no groupId is provided
    return {
      potBalance: 0,
      totalPayouts: 0,
      pendingPayoutsCount: 0,
      connectedWalletsCount: 0,
      totalMembersCount: 0,
      pendingRequests: [],
      recentActivities: [],
      totalExpenses: 0,
      isAdmin: false,
      handleApproveRequest: async () => {},
      handleRejectRequest: async () => {},
      loading: false,
      averagePayoutSize: 0,
      estimatedPayoutsRemaining: 0,
      recentExpensesCount: 0,
      latestExpenseDate: null,
      averageApprovalTime: "N/A",
      allGroupsStats: null
    };
  }
  
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
  
  // Get expenses data for statistics - make sure this is only called when groupId is defined
  const { expenses } = useExpenses(undefined, groupId);
  
  // Get cross-group statistics
  const { groups } = useGroupsList();
  const { allGroupsStats } = useCrossGroupStats(groups);
  
  // Calculate total expenses
  const totalExpenses = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  
  // Get group statistics using our statistics hook
  const {
    potBalance,
    totalPayouts,
    pendingPayoutsCount,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    averageApprovalTime
  } = useGroupStatistics(activities, expenses);
  
  return {
    potBalance,
    totalPayouts,
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
