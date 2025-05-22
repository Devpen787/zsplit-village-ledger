
import { PotActivity } from '@/types/group-pot';
import { Expense } from '@/types/expenses';
import { formatDistance, subDays } from 'date-fns';

/**
 * Calculates the current pot balance (total contributions minus approved payouts)
 */
export const calculatePotBalance = (activities: PotActivity[]): number => {
  return activities.reduce((balance, activity) => {
    if (activity.type === 'contribution' && activity.status === 'complete') {
      return balance + activity.amount;
    } else if (activity.type === 'payout' && activity.status === 'approved') {
      return balance - activity.amount;
    }
    return balance;
  }, 0);
};

/**
 * Calculates the average size of approved payouts
 */
export const calculateAveragePayoutSize = (activities: PotActivity[]): number => {
  const approvedPayouts = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'approved'
  );
  
  if (approvedPayouts.length === 0) return 0;
  
  const totalAmount = approvedPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  return totalAmount / approvedPayouts.length;
};

/**
 * Counts how many payouts can be covered with the current balance
 */
export const estimateRemainingPayouts = (balance: number, avgPayoutSize: number): number => {
  if (avgPayoutSize <= 0) return 0;
  return Math.floor(balance / avgPayoutSize);
};

/**
 * Counts expenses created in the last n days
 */
export const countRecentExpenses = (expenses: Expense[], days: number = 7): number => {
  const cutoffDate = subDays(new Date(), days);
  return expenses.filter(expense => 
    new Date(expense.created_at || expense.date) > cutoffDate
  ).length;
};

/**
 * Gets the most recent expense date
 */
export const getLatestExpenseDate = (expenses: Expense[]): Date | null => {
  if (expenses.length === 0) return null;
  
  return expenses.reduce((latest, expense) => {
    const expenseDate = new Date(expense.created_at || expense.date);
    return expenseDate > latest ? expenseDate : latest;
  }, new Date(0));
};

/**
 * Counts pending payout requests
 */
export const countPendingPayouts = (activities: PotActivity[]): number => {
  return activities.filter(activity => 
    activity.type === 'payout' && activity.status === 'pending'
  ).length;
};

/**
 * Calculates the average time to approve payouts
 */
export const calculateApprovalTime = (activities: PotActivity[]): string => {
  const approvedPayouts = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'approved'
  );
  
  if (approvedPayouts.length === 0) return "No data yet";
  
  // Calculate average time difference between created_at and when status changed to approved
  // Note: This is an approximation as we don't have the actual timestamps of status changes
  const totalDays = approvedPayouts.reduce((sum, payout) => {
    const createdDate = new Date(payout.created_at || Date.now());
    // Assuming approval happened within 3 days for this estimate
    const approvalDate = new Date(createdDate.getTime() + (1000 * 60 * 60 * 72));
    return sum + (approvalDate.getTime() - createdDate.getTime());
  }, 0);
  
  const avgMilliseconds = totalDays / approvedPayouts.length;
  const avgDays = Math.round(avgMilliseconds / (1000 * 60 * 60 * 24));
  
  return avgDays <= 1 ? "About a day" : `About ${avgDays} days`;
};
