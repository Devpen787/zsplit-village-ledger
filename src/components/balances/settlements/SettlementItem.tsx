
import React from 'react';
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';

interface SettlementItemProps {
  settlement: Settlement;
  onMarkAsSettled: () => void;
}

export const SettlementItem = ({ settlement, onMarkAsSettled }: SettlementItemProps) => {
  const { user } = useAuth();
  
  const isUserDebtor = settlement.fromUserId === user?.id;
  const isUserCreditor = settlement.toUserId === user?.id;
  const isUserInvolved = isUserDebtor || isUserCreditor;
  
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onMarkAsSettled}
          >
            Mark as Paid
          </Button>
        )}
        {settlement.settled && (
          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
            <Check className="h-4 w-4" /> Marked as settled
          </span>
        )}
      </div>
    </div>
  );
};
