
import React from 'react';
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { OnChainSettlementButton } from '@/components/crypto/OnChainSettlementButton';
import { useOnChainSettlements } from '@/hooks/useOnChainSettlements';

interface SettlementItemProps {
  settlement: Settlement;
  onMarkAsSettled: () => void;
}

export const SettlementItem = ({ settlement, onMarkAsSettled }: SettlementItemProps) => {
  const { user } = useAuth();
  const { getSettlementData, refreshSettlements } = useOnChainSettlements([settlement]);
  
  const isUserDebtor = settlement.fromUserId === user?.id;
  const isUserCreditor = settlement.toUserId === user?.id;
  const isUserInvolved = isUserDebtor || isUserCreditor;
  
  const onChainData = getSettlementData(settlement);
  const hasOnChainSettlement = onChainData?.tx_hash;
  
  const handleOnChainSettled = () => {
    refreshSettlements();
    onMarkAsSettled();
  };
  
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md mb-2 ${
        settlement.settled 
          ? 'bg-green-50/50 dark:bg-green-900/10' 
          : isUserInvolved 
            ? 'bg-primary/5' 
            : 'bg-secondary/10'
      }`}
    >
      <div className="flex items-center gap-2">
        {isUserDebtor ? (
          <>
            <span className="font-medium">You</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{settlement.toUserName}</span>
          </>
        ) : isUserCreditor ? (
          <>
            <span className="font-medium">{settlement.fromUserName}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">You</span>
          </>
        ) : (
          <>
            <span className="font-medium">{settlement.fromUserName}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{settlement.toUserName}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono font-semibold">{formatCurrency(settlement.amount)}</span>
        
        {!settlement.settled && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onMarkAsSettled}
            >
              Mark as Paid
            </Button>
            <OnChainSettlementButton
              settlement={settlement}
              onSettled={handleOnChainSettled}
              txHash={onChainData?.tx_hash}
              txChain={onChainData?.tx_chain}
            />
          </div>
        )}
        
        {settlement.settled && (
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <Check className="h-4 w-4" /> Marked as settled
            </span>
            {hasOnChainSettlement && (
              <OnChainSettlementButton
                settlement={settlement}
                onSettled={handleOnChainSettled}
                txHash={onChainData?.tx_hash}
                txChain={onChainData?.tx_chain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
