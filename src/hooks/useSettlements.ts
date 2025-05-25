
import { useState, useCallback, useEffect } from 'react';
import { BalanceData } from '@/components/balances/BalancesTable';
import { toast } from '@/components/ui/sonner';
import { 
  calculateOptimalSettlements, 
  hasUnsettledBalances as checkUnsettledBalances,
  areAllSettlementsSettled 
} from '@/utils/settlementUtils';

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
  
  const hasUnsettledBalances = checkUnsettledBalances(balances);
  const allSettled = areAllSettlementsSettled(settlements);
  
  const calculateSettlements = useCallback(() => {
    try {
      const payments = calculateOptimalSettlements(balances);
      setSettlements(payments);
      setShowSettlements(true);
      return payments;
    } catch (error) {
      console.error('Error calculating settlements:', error);
      toast.error('Settlement calculation failed - please try again');
      return [];
    }
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
