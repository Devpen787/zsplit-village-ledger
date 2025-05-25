
import { BalanceData } from '@/components/balances/BalancesTable';
import { Settlement } from '@/hooks/useSettlements';

const SETTLEMENT_THRESHOLD = 0.01; // Small threshold to handle floating point errors
const MAX_ITERATIONS = 100;

interface SettlementCalculationResult {
  settlements: Settlement[];
  hasError: boolean;
  errorMessage?: string;
}

export const calculateOptimalSettlements = (balances: BalanceData[]): Settlement[] => {
  const result = calculateSettlementsWithErrorHandling(balances);
  if (result.hasError) {
    throw new Error(result.errorMessage || 'Settlement calculation failed');
  }
  return result.settlements;
};

export const calculateSettlementsWithErrorHandling = (balances: BalanceData[]): SettlementCalculationResult => {
  try {
    // Validate input
    if (!Array.isArray(balances) || balances.length === 0) {
      return {
        settlements: [],
        hasError: false
      };
    }

    // Filter and sort users efficiently
    const debtors = balances
      .filter(balance => balance.netBalance < -SETTLEMENT_THRESHOLD)
      .sort((a, b) => a.netBalance - b.netBalance)
      .map(debtor => ({ ...debtor })); // Clone to avoid mutation
    
    const creditors = balances
      .filter(balance => balance.netBalance > SETTLEMENT_THRESHOLD)
      .sort((a, b) => b.netBalance - a.netBalance)
      .map(creditor => ({ ...creditor })); // Clone to avoid mutation

    console.log('Calculating settlements with debtors:', debtors.length, 'creditors:', creditors.length);
    
    if (debtors.length === 0 || creditors.length === 0) {
      return {
        settlements: [],
        hasError: false
      };
    }

    const payments: Settlement[] = [];
    let iterations = 0;
    
    while (debtors.length > 0 && creditors.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const debtAmount = Math.abs(debtor.netBalance);
      const creditAmount = creditor.netBalance;
      const paymentAmount = Math.min(debtAmount, creditAmount);
      
      if (paymentAmount > SETTLEMENT_THRESHOLD) {
        payments.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Number(paymentAmount.toFixed(2)),
          settled: false
        });
      }
      
      // Update balances
      debtor.netBalance += paymentAmount;
      creditor.netBalance -= paymentAmount;
      
      // Remove settled users
      if (Math.abs(debtor.netBalance) < SETTLEMENT_THRESHOLD) {
        debtors.shift();
      }
      
      if (Math.abs(creditor.netBalance) < SETTLEMENT_THRESHOLD) {
        creditors.shift();
      }
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.error('Settlement calculation exceeded maximum iterations');
      return {
        settlements: [],
        hasError: true,
        errorMessage: 'Settlement calculation exceeded maximum iterations'
      };
    }
    
    console.log('Settlement payments calculated:', payments);
    return {
      settlements: payments,
      hasError: false
    };
  } catch (error) {
    console.error('Error in settlement calculation:', error);
    return {
      settlements: [],
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error in settlement calculation'
    };
  }
};

export const hasUnsettledBalances = (balances: BalanceData[]): boolean => {
  if (!Array.isArray(balances)) return false;
  return balances.some(balance => Math.abs(balance.netBalance) > SETTLEMENT_THRESHOLD);
};

export const areAllSettlementsSettled = (settlements: Settlement[]): boolean => {
  if (!Array.isArray(settlements)) return true;
  return settlements.length > 0 && settlements.every(s => s.settled);
};

export const getTotalSettlementAmount = (settlements: Settlement[]): number => {
  if (!Array.isArray(settlements)) return 0;
  return settlements.reduce((total, settlement) => total + settlement.amount, 0);
};

export const getSettlementsForUser = (settlements: Settlement[], userId: string): Settlement[] => {
  if (!Array.isArray(settlements) || !userId) return [];
  return settlements.filter(s => s.fromUserId === userId || s.toUserId === userId);
};
