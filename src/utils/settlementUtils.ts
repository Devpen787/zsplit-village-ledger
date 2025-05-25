
import { BalanceData } from '@/components/balances/BalancesTable';
import { Settlement } from '@/hooks/useSettlements';

const SETTLEMENT_THRESHOLD = 0.01; // Small threshold to handle floating point errors
const MAX_ITERATIONS = 100;

export const calculateOptimalSettlements = (balances: BalanceData[]): Settlement[] => {
  // Filter users who owe money and users who are owed money
  const debtors = balances
    .filter(balance => balance.netBalance < -SETTLEMENT_THRESHOLD)
    .sort((a, b) => a.netBalance - b.netBalance); // Sort from largest debt to smallest
  
  const creditors = balances
    .filter(balance => balance.netBalance > SETTLEMENT_THRESHOLD)
    .sort((a, b) => b.netBalance - a.netBalance); // Sort from largest credit to smallest

  console.log('Calculating settlements with debtors:', debtors.length, 'creditors:', creditors.length);
  
  const payments: Settlement[] = [];
  const remainingDebtors = [...debtors];
  const remainingCreditors = [...creditors];
  
  let iterations = 0;
  
  while (remainingDebtors.length > 0 && remainingCreditors.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    const debtor = remainingDebtors[0];
    const creditor = remainingCreditors[0];
    
    // How much the debtor owes (make it positive for easier comparison)
    const debtAmount = Math.abs(debtor.netBalance);
    // How much the creditor is owed
    const creditAmount = creditor.netBalance;
    
    // The payment is the minimum of what's owed and what's due
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
    
    // Remove users who have settled up
    if (Math.abs(debtor.netBalance) < SETTLEMENT_THRESHOLD) {
      remainingDebtors.shift();
    }
    
    if (Math.abs(creditor.netBalance) < SETTLEMENT_THRESHOLD) {
      remainingCreditors.shift();
    }
  }
  
  if (iterations >= MAX_ITERATIONS) {
    console.error('Settlement calculation exceeded maximum iterations');
    throw new Error('Settlement calculation failed - please try again');
  }
  
  console.log('Settlement payments calculated:', payments);
  return payments;
};

export const hasUnsettledBalances = (balances: BalanceData[]): boolean => {
  return balances.some(balance => Math.abs(balance.netBalance) > SETTLEMENT_THRESHOLD);
};

export const areAllSettlementsSettled = (settlements: Settlement[]): boolean => {
  return settlements.length > 0 && settlements.every(s => s.settled);
};
