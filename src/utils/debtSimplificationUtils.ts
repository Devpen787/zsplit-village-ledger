
import { BalanceData } from '@/components/balances/BalancesTable';

export interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PaymentSuggestion {
  debts: SimplifiedDebt[];
  totalTransactions: number;
  totalAmount: number;
  canSimplify: boolean;
}

/**
 * Simplifies debts using a greedy algorithm to minimize transactions
 * Similar to Splitwise's debt simplification feature
 */
export const simplifyDebts = (balances: BalanceData[]): PaymentSuggestion => {
  // Filter out users with balanced accounts (within small threshold)
  const THRESHOLD = 0.01;
  const activeBalances = balances.filter(b => Math.abs(b.netBalance) > THRESHOLD);
  
  if (activeBalances.length === 0) {
    return {
      debts: [],
      totalTransactions: 0,
      totalAmount: 0,
      canSimplify: false
    };
  }

  // Separate debtors and creditors
  const debtors = activeBalances
    .filter(b => b.netBalance < -THRESHOLD)
    .map(d => ({ ...d, remainingDebt: Math.abs(d.netBalance) }))
    .sort((a, b) => b.remainingDebt - a.remainingDebt);
    
  const creditors = activeBalances
    .filter(b => b.netBalance > THRESHOLD)
    .map(c => ({ ...c, remainingCredit: c.netBalance }))
    .sort((a, b) => b.remainingCredit - a.remainingCredit);

  const simplifiedDebts: SimplifiedDebt[] = [];
  let totalAmount = 0;

  // Greedy algorithm: match largest debtor with largest creditor
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    const paymentAmount = Math.min(debtor.remainingDebt, creditor.remainingCredit);
    
    if (paymentAmount > THRESHOLD) {
      // Determine priority based on amount
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (paymentAmount > 100) priority = 'high';
      else if (paymentAmount > 50) priority = 'medium';
      
      simplifiedDebts.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName || 'Unknown',
        toUserId: creditor.userId,
        toUserName: creditor.userName || 'Unknown',
        amount: Number(paymentAmount.toFixed(2)),
        priority
      });
      
      totalAmount += paymentAmount;
      
      // Update remaining amounts
      debtor.remainingDebt -= paymentAmount;
      creditor.remainingCredit -= paymentAmount;
    }
    
    // Remove settled users
    if (debtor.remainingDebt <= THRESHOLD) {
      debtors.shift();
    }
    if (creditor.remainingCredit <= THRESHOLD) {
      creditors.shift();
    }
  }

  return {
    debts: simplifiedDebts,
    totalTransactions: simplifiedDebts.length,
    totalAmount: Number(totalAmount.toFixed(2)),
    canSimplify: simplifiedDebts.length > 0
  };
};

/**
 * Get debts involving a specific user
 */
export const getMyDebts = (debts: SimplifiedDebt[], userId: string) => {
  return {
    iOwe: debts.filter(d => d.fromUserId === userId),
    owedToMe: debts.filter(d => d.toUserId === userId)
  };
};

/**
 * Calculate how much debt simplification saves
 */
export const calculateSavings = (originalTransactions: number, simplifiedTransactions: number) => {
  const saved = originalTransactions - simplifiedTransactions;
  const percentSaved = originalTransactions > 0 ? (saved / originalTransactions) * 100 : 0;
  return {
    transactionsSaved: saved,
    percentageSaved: Math.round(percentSaved)
  };
};
