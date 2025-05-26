
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, ArrowRight } from "lucide-react";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { OnChainSettlementButton } from '@/components/crypto/OnChainSettlementButton';
import { useOnChainSettlements } from '@/hooks/useOnChainSettlements';

interface PendingPaymentsProps {
  settlements: Settlement[];
  onMarkAsPaid: (index: number) => void;
  payingIndex: number | null;
}

export const PendingPayments = ({ 
  settlements, 
  onMarkAsPaid, 
  payingIndex 
}: PendingPaymentsProps) => {
  const { user } = useAuth();
  const { getSettlementData, refreshSettlements } = useOnChainSettlements(settlements);

  const userSettlements = settlements.filter(s => 
    s.fromUserId === user?.id || s.toUserId === user?.id
  );
  const pendingSettlements = userSettlements.filter(s => !s.settled);

  if (pendingSettlements.length === 0) {
    return null;
  }

  const handleOnChainSettled = (index: number) => {
    refreshSettlements();
    onMarkAsPaid(index);
  };

  return (
    <div>
      <h3 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Pending Payments ({pendingSettlements.length})
      </h3>
      <div className="space-y-3">
        {pendingSettlements.map((settlement, index) => {
          const actualIndex = settlements.findIndex(s => 
            s.fromUserId === settlement.fromUserId && 
            s.toUserId === settlement.toUserId &&
            s.amount === settlement.amount
          );
          const isUserDebtor = settlement.fromUserId === user?.id;
          const isPaying = payingIndex === actualIndex;
          const onChainData = getSettlementData(settlement);
          
          return (
            <div 
              key={`pending-${index}`}
              className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-900/10"
            >
              <div className="flex items-center gap-3">
                {isUserDebtor ? (
                  <>
                    <span className="font-medium">You</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{settlement.toUserName}</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{settlement.fromUserName}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">You</span>
                  </>
                )}
                <Badge variant="destructive">
                  {formatCurrency(settlement.amount)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {isUserDebtor && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onMarkAsPaid(actualIndex)}
                      disabled={isPaying}
                      className="flex items-center gap-1"
                    >
                      {isPaying ? (
                        <>
                          <Clock className="h-3 w-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3 w-3" />
                          Mark as Paid
                        </>
                      )}
                    </Button>
                    <OnChainSettlementButton
                      settlement={settlement}
                      onSettled={() => handleOnChainSettled(actualIndex)}
                      txHash={onChainData?.tx_hash}
                    />
                  </>
                )}
                {!isUserDebtor && (
                  <Badge variant="outline">Waiting for payment</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
