
import React from 'react';
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';

interface SettlementListProps {
  settlements: Settlement[];
  onMarkAsSettled: (index: number) => void;
  showUserSettlementsOnly?: boolean;
}

export const SettlementList = ({ 
  settlements, 
  onMarkAsSettled,
  showUserSettlementsOnly = false 
}: SettlementListProps) => {
  const { user } = useAuth();
  
  // Find settlements involving current user if showUserSettlementsOnly is true
  const settlementsToShow = showUserSettlementsOnly 
    ? settlements.filter(s => s.fromUserId === user?.id || s.toUserId === user?.id)
    : settlements;
  
  if (settlementsToShow.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      {showUserSettlementsOnly && (
        <h3 className="font-medium text-sm mb-3 text-muted-foreground">Your settlements</h3>
      )}
      
      {settlementsToShow.map((settlement, index) => {
        const actualIndex = showUserSettlementsOnly 
          ? settlements.findIndex(s => 
              s.fromUserId === settlement.fromUserId && 
              s.toUserId === settlement.toUserId &&
              s.amount === settlement.amount
            )
          : index;
          
        const isUserDebtor = settlement.fromUserId === user?.id;
        const isUserCreditor = settlement.toUserId === user?.id;
        const isUserInvolved = isUserDebtor || isUserCreditor;
        
        return (
          <div 
            key={`${showUserSettlementsOnly ? 'user-' : ''}${index}`} 
            className={`flex items-center justify-between p-3 rounded-md mb-2 ${isUserInvolved && showUserSettlementsOnly ? 'bg-primary/5' : 'bg-secondary/10'}`}
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
              <span className="font-mono font-semibold">{settlement.amount.toFixed(2)} CHF</span>
              {!settlement.settled && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onMarkAsSettled(actualIndex)}
                >
                  Mark as Paid
                </Button>
              )}
              {settlement.settled && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" /> Paid
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
