
import { useState } from 'react';
import { usePulseActivities } from './group-pulse/usePulseActivities';
import { usePulseAdmin } from './group-pulse/usePulseAdmin';
import { usePulsePayouts } from './group-pulse/usePulsePayouts';
import { useGroupConnectivity } from './group-pulse/useGroupConnectivity';
import { PotActivity } from '@/types/group-pot';
import { useExpenses } from './useExpenses';
import { useCrossGroupStats, AllGroupsStats } from './group-pulse/useCrossGroupStats';
import { useGroupsList } from './useGroupsList';

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
  // Add the missing properties
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  averageApprovalTime: string;
  allGroupsStats: AllGroupsStats | null;
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
  
  // Get cross-group statistics
  const { groups } = useGroupsList();
  const { allGroupsStats } = useCrossGroupStats(groups);
  
  // Calculate total expenses
  const totalExpenses = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  
  // Pending payouts count
  const pendingPayoutsCount = pendingRequests.length;
  
  // Calculate average payout size based on recent payouts
  const averagePayoutSize = 150; // Placeholder value, in a real implementation we would calculate from history
  
  // Calculate estimated payouts remaining
  const estimatedPayoutsRemaining = potBalance > 0 && averagePayoutSize > 0 
    ? potBalance / averagePayoutSize 
    : 0;
  
  // Recent expenses statistics
  const recentExpensesCount = 5; // Placeholder value
  const latestExpenseDate = expenses && expenses.length > 0 
    ? new Date(expenses[0].date || expenses[0].created_at) 
    : null;
  
  // Average approval time
  const averageApprovalTime = "24 hours"; // Placeholder value
  
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
    // Add the missing properties to the return value
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    averageApprovalTime,
    allGroupsStats
  };
};
