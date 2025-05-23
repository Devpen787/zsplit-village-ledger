
import { useState, useEffect } from 'react';
import { PotActivity } from '@/types/group-pot';
import { Expense } from '@/types/expenses';
import { fetchGroupPotActivities } from '@/services/groupPotService';
import { fetchGroupExpenses } from '@/services/groupPulseService';
import { toast } from '@/components/ui/sonner';
import { 
  calculatePotBalance, 
  calculateAveragePayoutSize,
  estimateRemainingPayouts,
  countRecentExpenses,
  getLatestExpenseDate,
  countPendingPayouts,
  calculateApprovalTime
} from '@/utils/groupPulseUtils';

interface PulseActivitiesData {
  loading: boolean;
  activities: PotActivity[];
  expenses: Expense[];
  potBalance: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  pendingPayoutsCount: number;
  averageApprovalTime: string;
  pendingRequests: PotActivity[];
}

export const usePulseActivities = (groupId: string): PulseActivitiesData => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PotActivity[]>([]);
  const [pulseData, setPulseData] = useState({
    potBalance: 0,
    averagePayoutSize: 0,
    estimatedPayoutsRemaining: 0,
    recentExpensesCount: 0,
    latestExpenseDate: null as Date | null,
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
  }, [groupId]);
  
  return {
    loading,
    activities,
    expenses,
    ...pulseData,
    pendingRequests
  };
};
