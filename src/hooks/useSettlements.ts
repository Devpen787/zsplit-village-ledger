
import { useState, useCallback, useEffect } from 'react';
import { BalanceData } from '@/components/balances/BalancesTable';
import { toast } from '@/components/ui/sonner';
import { 
  calculateOptimalSettlements, 
  calculateSettlementsWithErrorHandling,
  hasUnsettledBalances as checkUnsettledBalances,
  areAllSettlementsSettled,
  getTotalSettlementAmount,
  getSettlementsForUser
} from '@/utils/settlementUtils';

export type Settlement = {
  fromUserId: string;
  fromUserName: string | null;
  toUserId: string;
  toUserName: string | null;
  amount: number;
  settled?: boolean;
};

interface UseSettlementsReturn {
  settlements: Settlement[];
  showSettlements: boolean;
  hasUnsettledBalances: boolean;
  allSettled: boolean;
  totalAmount: number;
  handleSettleUp: () => void;
  markAsSettled: (index: number) => void;
  hideSettlements: () => void;
  calculateSettlements: () => Settlement[];
  setShowSettlements: (show: boolean) => void;
  getMySettlements: (userId: string) => Settlement[];
}

export const useSettlements = (balances: BalanceData[]): UseSettlementsReturn => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showSettlements, setShowSettlements] = useState(false);
  
  const hasUnsettledBalances = checkUnsettledBalances(balances);
  const allSettled = areAllSettlementsSettled(settlements);
  const totalAmount = getTotalSettlementAmount(settlements);
  
  const calculateSettlements = useCallback(() => {
    try {
      const result = calculateSettlementsWithErrorHandling(balances);
      
      if (result.hasError) {
        console.error('Settlement calculation error:', result.errorMessage);
        toast.error(result.errorMessage || 'Settlement calculation failed - please try again');
        return [];
      }
      
      setSettlements(result.settlements);
      setShowSettlements(true);
      return result.settlements;
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
    } else if (payments.length > 0) {
      toast.success(`${payments.length} settlement${payments.length > 1 ? 's' : ''} calculated.`);
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

  const getMySettlements = useCallback((userId: string) => {
    return getSettlementsForUser(settlements, userId);
  }, [settlements]);
  
  return {
    settlements,
    showSettlements,
    setShowSettlements,
    hasUnsettledBalances,
    allSettled,
    totalAmount,
    handleSettleUp,
    markAsSettled,
    hideSettlements,
    calculateSettlements,
    getMySettlements
  };
};
