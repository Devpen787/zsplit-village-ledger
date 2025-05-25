
import { useMemo } from 'react';
import { PotActivity } from '@/types/group-pot';
import { Expense } from '@/types/expenses';
import { 
  calculatePotBalance,
  countPendingPayouts,
  calculateAveragePayoutSize,
  estimateRemainingPayouts,
  countRecentExpenses,
  getLatestExpenseDate,
  calculateApprovalTime
} from '@/utils/groupPulseUtils';

interface GroupMetricsData {
  potBalance: number;
  totalPayouts: number;
  pendingPayoutsCount: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  averageApprovalTime: string;
  totalExpenses: number;
}

export const useGroupMetrics = (
  activities: PotActivity[], 
  expenses: Expense[]
): GroupMetricsData => {
  return useMemo(() => {
    const potBalance = calculatePotBalance(activities);
    const pendingPayoutsCount = countPendingPayouts(activities);
    
    const approvedPayouts = activities.filter(
      activity => activity.type === 'payout' && activity.status === 'approved'
    );
    const totalPayouts = approvedPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    
    const averagePayoutSize = calculateAveragePayoutSize(activities);
    const estimatedPayoutsRemaining = estimateRemainingPayouts(potBalance, averagePayoutSize);
    
    const recentExpensesCount = countRecentExpenses(expenses);
    const latestExpenseDate = getLatestExpenseDate(expenses);
    const averageApprovalTime = calculateApprovalTime(activities);
    
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    return {
      potBalance,
      totalPayouts,
      pendingPayoutsCount,
      averagePayoutSize,
      estimatedPayoutsRemaining,
      recentExpensesCount,
      latestExpenseDate,
      averageApprovalTime,
      totalExpenses
    };
  }, [activities, expenses]);
};
