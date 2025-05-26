
import React from 'react';
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { SettlementItem } from './SettlementItem';

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
          
        return (
          <SettlementItem
            key={`${showUserSettlementsOnly ? 'user-' : ''}${index}`}
            settlement={settlement}
            onMarkAsSettled={() => onMarkAsSettled(actualIndex)}
          />
        );
      })}
    </div>
  );
};
