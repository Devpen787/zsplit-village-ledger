
import { usePulseActivities } from './group-pulse/usePulseActivities';
import { usePulseAdmin } from './group-pulse/usePulseAdmin';
import { usePulsePayouts } from './group-pulse/usePulsePayouts';
import { useGroupConnectivity } from './group-pulse/useGroupConnectivity';
import { useGroupMetrics } from './group-pulse/useGroupMetrics';
import { useExpenses } from './adapters/useExpenses';
import { useCrossGroupStats, AllGroupsStats } from './group-pulse/useCrossGroupStats';
import { useGroupsList } from './useGroupsList';

interface GroupPulseData {
  // Metrics
  potBalance: number;
  totalPayouts: number;
  pendingPayoutsCount: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  averageApprovalTime: string;
  totalExpenses: number;
  
  // Connectivity
  connectedWalletsCount: number;
  totalMembersCount: number;
  
  // Activities
  pendingRequests: any[];
  recentActivities: any[];
  
  // Admin & Actions
  isAdmin: boolean;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
  
  // State
  loading: boolean;
  allGroupsStats: AllGroupsStats | null;
}

export const useGroupPulse = (groupId: string | undefined): GroupPulseData => {
  // Guard against undefined groupId
  if (!groupId) {
    return {
      potBalance: 0,
      totalPayouts: 0,
      pendingPayoutsCount: 0,
      averagePayoutSize: 0,
      estimatedPayoutsRemaining: 0,
      recentExpensesCount: 0,
      latestExpenseDate: null,
      averageApprovalTime: "N/A",
      totalExpenses: 0,
      connectedWalletsCount: 0,
      totalMembersCount: 0,
      pendingRequests: [],
      recentActivities: [],
      isAdmin: false,
      handleApproveRequest: async () => {},
      handleRejectRequest: async () => {},
      loading: false,
      allGroupsStats: null
    };
  }
  
  // Get core data
  const { 
    activities,
    pendingRequests,
    recentActivities,
    loading,
    setActivities,
    setPendingRequests
  } = usePulseActivities(groupId);
  
  const { isAdmin } = usePulseAdmin(groupId);
  const { expenses } = useExpenses(undefined, groupId);
  const { connectedWalletsCount, totalMembersCount } = useGroupConnectivity(groupId);
  const { groups } = useGroupsList();
  const { allGroupsStats } = useCrossGroupStats(groups);
  
  // Calculate metrics
  const metrics = useGroupMetrics(activities, expenses || []);
  
  // Get action handlers
  const { handleApproveRequest, handleRejectRequest } = 
    usePulsePayouts(groupId, setActivities, pendingRequests, setPendingRequests);
  
  return {
    ...metrics,
    connectedWalletsCount,
    totalMembersCount,
    pendingRequests,
    recentActivities,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest,
    loading,
    allGroupsStats
  };
};
