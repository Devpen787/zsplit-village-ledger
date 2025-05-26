
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Settlement } from './useSettlements';

interface OnChainSettlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  tx_hash: string | null;
  settled: boolean;
}

export const useOnChainSettlements = (settlements: Settlement[]) => {
  const [onChainData, setOnChainData] = useState<OnChainSettlement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOnChainSettlements = async () => {
      if (settlements.length === 0) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('settlements')
          .select('from_user_id, to_user_id, amount, tx_hash, settled');

        if (error) {
          console.error('Error fetching on-chain settlements:', error);
          return;
        }

        setOnChainData(data || []);
      } catch (error) {
        console.error('Error in fetchOnChainSettlements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnChainSettlements();
  }, [settlements]);

  const getSettlementData = (settlement: Settlement) => {
    return onChainData.find(
      (item) =>
        item.from_user_id === settlement.fromUserId &&
        item.to_user_id === settlement.toUserId
    );
  };

  const refreshSettlements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settlements')
        .select('from_user_id, to_user_id, amount, tx_hash, settled');

      if (error) {
        console.error('Error refreshing settlements:', error);
        return;
      }

      setOnChainData(data || []);
    } catch (error) {
      console.error('Error refreshing settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    onChainData,
    loading,
    getSettlementData,
    refreshSettlements
  };
};
