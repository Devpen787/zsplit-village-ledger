
import { useState } from 'react';
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
  
  // Calculate if there are any unsettled balances
  const hasUnsettledBalances = balances.some(balance => 
    Math.abs(balance.netBalance) > 0.01
  );
  
  // Check if all suggested payments are marked as settled
  const allSettled = settlements.length > 0 && settlements.every(s => s.settled);
  
  // Calculate optimal settlements
  const calculateSettlements = () => {
    // Filter users who owe money and users who are owed money
    const debtors = balances
      .filter(balance => balance.netBalance < -0.01) // Small threshold to handle floating point errors
      .sort((a, b) => a.netBalance - b.netBalance); // Sort from largest debt to smallest
    
    const creditors = balances
      .filter(balance => balance.netBalance > 0.01) // Small threshold to handle floating point errors
      .sort((a, b) => b.netBalance - a.netBalance); // Sort from largest credit to smallest

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
    
    setSettlements(payments);
    setShowSettlements(true);
  };
  
  const handleSettleUp = () => {
    calculateSettlements();
  };
  
  const markAsSettled = (index: number) => {
    setSettlements(prev => 
      prev.map((settlement, i) => 
        i === index ? { ...settlement, settled: true } : settlement
      )
    );
    
    toast.success("Payment marked as settled!");
  };
  
  const hideSettlements = () => {
    setShowSettlements(false);
  };
  
  return {
    settlements,
    showSettlements,
    hasUnsettledBalances,
    allSettled,
    handleSettleUp,
    markAsSettled,
    hideSettlements
  };
};
