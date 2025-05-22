
import { useState, useEffect } from 'react';
import { fetchGroupExpenses } from '@/services/groupPulseService';
import { fetchGroupPotActivities, approvePayoutRequest, rejectPayoutRequest } from '@/services/groupPotService';
import { checkUserIsAdmin } from '@/services/groupPotService';
import { 
  calculatePotBalance, 
  calculateAveragePayoutSize,
  estimateRemainingPayouts,
  countRecentExpenses,
  getLatestExpenseDate,
  countPendingPayouts,
  calculateApprovalTime
} from '@/utils/groupPulseUtils';
import { toast } from '@/components/ui/sonner';
import { Expense } from '@/types/expenses';
import { PotActivity } from '@/types/group-pot';
import { useAuth } from '@/contexts';
import { supabase } from '@/integrations/supabase/client';

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
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const useGroupPulse = (groupId: string): GroupPulseData => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PotActivity[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectedWalletsCount, setConnectedWalletsCount] = useState(0);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  const [pulseData, setPulseData] = useState<Omit<GroupPulseData, 'loading' | 'pendingRequests' | 'isAdmin' | 'connectedWalletsCount' | 'totalMembersCount' | 'handleApproveRequest' | 'handleRejectRequest'>>({
    potBalance: 0,
    averagePayoutSize: 0,
    estimatedPayoutsRemaining: 0,
    recentExpensesCount: 0,
    latestExpenseDate: null,
    pendingPayoutsCount: 0,
    averageApprovalTime: 'No data yet'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [expensesData, activitiesData] = await Promise.all([
          fetchGroupExpenses(groupId),
          fetchGroupPotActivities(groupId)
        ]);
        
        setExpenses(expensesData);
        setActivities(activitiesData);
        
        // Extract pending requests
        const pending = activitiesData.filter(
          activity => activity.type === 'payout' && activity.status === 'pending'
        );
        setPendingRequests(pending);
        
        // Calculate all metrics
        const potBalance = calculatePotBalance(activitiesData);
        const avgPayoutSize = calculateAveragePayoutSize(activitiesData);
        
        setPulseData({
          potBalance,
          averagePayoutSize: avgPayoutSize,
          estimatedPayoutsRemaining: estimateRemainingPayouts(potBalance, avgPayoutSize),
          recentExpensesCount: countRecentExpenses(expensesData),
          latestExpenseDate: getLatestExpenseDate(expensesData),
          pendingPayoutsCount: countPendingPayouts(activitiesData),
          averageApprovalTime: calculateApprovalTime(activitiesData)
        });
        
        // Fetch group members with wallet info
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('user_id, users:user_id(wallet_address)')
          .eq('group_id', groupId);
          
        if (membersError) throw membersError;
        
        if (members) {
          const totalMembers = members.length;
          const withWallets = members.filter(m => m.users?.wallet_address).length;
          setConnectedWalletsCount(withWallets);
          setTotalMembersCount(totalMembers);
        }
        
        // Check if user is admin
        if (user) {
          const admin = await checkUserIsAdmin(groupId, user.id);
          setIsAdmin(admin);
        }
      } catch (error) {
        console.error('Error fetching group pulse data:', error);
        toast.error('Failed to load group pulse data');
      } finally {
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchData();
    }
  }, [groupId, user]);

  const handleApproveRequest = async (activityId: string) => {
    try {
      await approvePayoutRequest(activityId);
      
      toast.success('Payout request approved');
      
      // Update the activities in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved' } 
            : activity
        )
      );
      
      // Update pending requests
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== activityId)
      );
      
    } catch (error) {
      console.error('Error approving payout request:', error);
      toast.error('Failed to approve payout request');
    }
  };
  
  const handleRejectRequest = async (activityId: string) => {
    try {
      await rejectPayoutRequest(activityId);
      
      toast.success('Payout request rejected');
      
      // Update the activities in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected' } 
            : activity
        )
      );
      
      // Update pending requests
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== activityId)
      );
      
    } catch (error) {
      console.error('Error rejecting payout request:', error);
      toast.error('Failed to reject payout request');
    }
  };
  
  return {
    loading,
    ...pulseData,
    pendingRequests,
    isAdmin,
    connectedWalletsCount,
    totalMembersCount,
    handleApproveRequest,
    handleRejectRequest
  };
};
