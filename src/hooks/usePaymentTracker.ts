
import { useState } from 'react';
import { Settlement } from '@/hooks/useSettlements';
import { toast } from '@/components/ui/sonner';

export const usePaymentTracker = (onMarkAsSettled: (index: number) => void, onUndoSettlement: (index: number) => void) => {
  const [payingIndex, setPayingIndex] = useState<number | null>(null);

  const handleMarkAsPaid = (index: number) => {
    setPayingIndex(index);
    
    // Simulate payment processing
    setTimeout(() => {
      onMarkAsSettled(index);
      setPayingIndex(null);
      toast.success("Payment marked as settled!");
    }, 1500);
  };

  const handleUndoPayment = (index: number) => {
    onUndoSettlement(index);
    toast.info("Settlement undone - payment marked as pending");
  };

  return {
    payingIndex,
    handleMarkAsPaid,
    handleUndoPayment
  };
};
