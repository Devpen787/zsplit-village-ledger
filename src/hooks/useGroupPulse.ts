
import { useState, useEffect } from 'react';
import { fetchGroupExpenses } from '@/services/groupPulseService';
import { fetchGroupPotActivities } from '@/services/groupPotService';
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

interface GroupPulseData {
  loading: boolean;
  potBalance: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  pendingPayoutsCount: number;
  averageApprovalTime: string;
}

export const useGroupPulse = (groupId: string): GroupPulseData => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [pulseData, setPulseData] = useState<Omit<GroupPulseData, 'loading'>>({
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
        
        // Fetch both data sets in parallel
        const [expensesData, activitiesData] = await Promise.all([
          fetchGroupExpenses(groupId),
          fetchGroupPotActivities(groupId)
        ]);
        
        setExpenses(expensesData);
        setActivities(activitiesData);
        
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
    ...pulseData
  };
};
