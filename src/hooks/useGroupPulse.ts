
import { useState } from 'react';
import { usePulseActivities } from './group-pulse/usePulseActivities';
import { useGroupConnectivity } from './group-pulse/useGroupConnectivity';
import { usePulseAdmin } from './group-pulse/usePulseAdmin';
import { usePulsePayouts } from './group-pulse/usePulsePayouts';
import { useCrossGroupStats, AllGroupsStats } from './group-pulse/useCrossGroupStats';
import { useGroupsList } from '@/hooks/useGroupsList';
import { PotActivity } from '@/types/group-pot';

interface GroupPulseData {
  loading: boolean;
  potBalance: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  pendingPayoutsCount: number;
  averageApprovalTime: string;
  pendingRequests: PotActivity[];
  isAdmin: boolean;
  connectedWalletsCount: number;
  totalMembersCount: number;
  allGroupsStats: AllGroupsStats | null;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const useGroupPulse = (groupId: string): GroupPulseData => {
  // Get group list for cross-group statistics
  const { groups } = useGroupsList();
  
  // Get activities data
  const { 
    loading,
    activities,
    setActivities = useState<PotActivity[]>([])[1],
    potBalance,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    setPendingRequests = useState<PotActivity[]>([])[1]
  } = usePulseActivities(groupId);
  
  // Get group connectivity data
  const { connectedWalletsCount, totalMembersCount } = useGroupConnectivity(groupId);
  
  // Get admin status
  const { isAdmin } = usePulseAdmin(groupId);
  
  // Get cross-group statistics
  const { allGroupsStats } = useCrossGroupStats(groups);
  
  // Get payout controls
  const { handleApproveRequest, handleRejectRequest } = usePulsePayouts(
    activities, 
    setActivities, 
    setPendingRequests
  );
  
  return {
    loading,
    potBalance,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    isAdmin,
    connectedWalletsCount,
    totalMembersCount,
    allGroupsStats,
    handleApproveRequest,
    handleRejectRequest
  };
};
