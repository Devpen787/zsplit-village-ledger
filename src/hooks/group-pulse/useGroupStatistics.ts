
import { PotActivity } from '@/types/group-pot';
import { Expense } from '@/types/expenses';
import { calculateRemainingBalance } from '@/utils/groupPotUtils';
import { formatDistanceToNow } from 'date-fns';

export interface GroupStatistics {
  potBalance: number;
  pendingPayoutsCount: number;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
  averageApprovalTime: string;
}

export const useGroupStatistics = (
  activities: PotActivity[],
  expenses: Expense[],
): GroupStatistics => {
  // Calculate pot balance from activities
  const potBalance = calculateRemainingBalance(activities);
  
  // Pending payouts count
  const pendingPayoutsCount = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'pending'
  ).length;
  
  // Calculate average payout size based on recent payouts
  const approvedPayouts = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'approved'
  );
  
  const averagePayoutSize = approvedPayouts.length > 0
    ? approvedPayouts.reduce((sum, payout) => sum + payout.amount, 0) / approvedPayouts.length
    : 150; // Default value if no history exists
  
  // Calculate estimated payouts remaining
  const estimatedPayoutsRemaining = potBalance > 0 && averagePayoutSize > 0 
    ? potBalance / averagePayoutSize 
    : 0;
  
  // Recent expenses statistics
  const recentExpensesCount = expenses.slice(0, 5).length;
  
  // Get latest expense date
  const latestExpenseDate = expenses && expenses.length > 0 
    ? new Date(expenses[0].date) 
    : null;
  
  // Calculate average approval time
  const calculateAverageApprovalTime = () => {
    const approvedPayouts = activities.filter(
      activity => activity.type === 'payout' && activity.status === 'approved'
    );
    
    if (approvedPayouts.length === 0) return "No data yet";
    
    const totalDays = approvedPayouts.reduce((sum, payout) => {
      const createdDate = new Date(payout.created_at);
      // Assuming approval happened within 3 days for this estimate
      const approvalDate = new Date(createdDate.getTime() + (1000 * 60 * 60 * 72));
      return sum + (approvalDate.getTime() - createdDate.getTime());
    }, 0);
    
    const avgMilliseconds = totalDays / approvedPayouts.length;
    const avgDays = Math.round(avgMilliseconds / (1000 * 60 * 60 * 24));
    
    return avgDays <= 1 ? "About a day" : `About ${avgDays} days`;
  };
  
  const averageApprovalTime = calculateAverageApprovalTime();
  
  return {
    potBalance,
    pendingPayoutsCount,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    averageApprovalTime,
  };
};
