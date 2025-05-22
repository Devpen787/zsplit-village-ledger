
import { useState, useCallback, useEffect } from 'react';
import { BalanceData } from '@/components/balances/BalancesTable';
import { toast } from '@/components/ui/sonner';

export type Settlement = {
  fromUserId: string;
  fromUserName: string | null;
  toUserId: string;
  toUserName: string | null;
  amount: number;
  settled?: boolean;
};

export const useSettlements = (balances: BalanceData[]) => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showSettlements, setShowSettlements] = useState(false);
  
  // Calculate if there are any unsettled balances - use a small threshold to handle floating point errors
  const hasUnsettledBalances = balances.some(balance => 
    Math.abs(balance.netBalance) > 0.01
  );
  
  // Check if all suggested payments are marked as settled
  const allSettled = settlements.length > 0 && settlements.every(s => s.settled);
  
  // Calculate optimal settlements
  const calculateSettlements = useCallback(() => {
    // Filter users who owe money and users who are owed money
    const debtors = balances
      .filter(balance => balance.netBalance < -0.01) // Small threshold to handle floating point errors
      .sort((a, b) => a.netBalance - b.netBalance); // Sort from largest debt to smallest
    
    const creditors = balances
      .filter(balance => balance.netBalance > 0.01) // Small threshold to handle floating point errors
      .sort((a, b) => b.netBalance - a.netBalance); // Sort from largest credit to smallest

    console.log('Calculating settlements with debtors:', debtors.length, 'creditors:', creditors.length);
    
    // Calculate the optimal payments to settle balances
    const payments: Settlement[] = [];
    
    // Create clones to work with
    const remainingDebtors = [...debtors];
    const remainingCreditors = [...creditors];
    
    while (remainingDebtors.length > 0 && remainingCreditors.length > 0) {
      const debtor = remainingDebtors[0];
      const creditor = remainingCreditors[0];
      
      // How much the debtor owes (make it positive for easier comparison)
      const debtAmount = Math.abs(debtor.netBalance);
      // How much the creditor is owed
      const creditAmount = creditor.netBalance;
      
      // The payment is the minimum of what's owed and what's due
      const paymentAmount = Math.min(debtAmount, creditAmount);
      
      if (paymentAmount > 0.01) { // Ignore tiny payments
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
      if (Math.abs(debtor.netBalance) < 0.01) {
        remainingDebtors.shift();
      }
      
      if (Math.abs(creditor.netBalance) < 0.01) {
        remainingCreditors.shift();
      }
    }
    
    console.log('Settlement payments calculated:', payments);
    setSettlements(payments);
    setShowSettlements(true);
    
    return payments;
  }, [balances]);
  
  // Automatically calculate settlements when there are unsettled balances
  useEffect(() => {
    if (hasUnsettledBalances && settlements.length === 0) {
      calculateSettlements();
    }
  }, [hasUnsettledBalances, settlements.length, calculateSettlements]);
  
  const handleSettleUp = useCallback(() => {
    const payments = calculateSettlements();
    
    if (payments.length === 0 && hasUnsettledBalances) {
      toast.info("No settlement suggestions could be calculated.");
    }
  }, [calculateSettlements, hasUnsettledBalances]);
  
  const markAsSettled = useCallback((index: number) => {
    setSettlements(prev => 
      prev.map((settlement, i) => 
        i === index ? { ...settlement, settled: true } : settlement
      )
    );
    
    toast.success("Payment marked as settled!");
  }, []);
  
  const hideSettlements = useCallback(() => {
    setShowSettlements(false);
  }, []);
  
  return {
    settlements,
    showSettlements,
    setShowSettlements,
    hasUnsettledBalances,
    allSettled,
    handleSettleUp,
    markAsSettled,
    hideSettlements,
    calculateSettlements
  };
};
