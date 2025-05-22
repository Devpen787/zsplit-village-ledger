
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { BalanceData } from '../BalancesTable';
import { useAuth } from '@/contexts';
import { SettlementStatus } from './SettlementStatus';
import { SettlementList } from './SettlementList';
import { useSettlements } from '@/hooks/useSettlements';

interface SettlementActionsProps {
  balances: BalanceData[];
}

export const SettlementActions = ({ balances }: SettlementActionsProps) => {
  const { user } = useAuth();
  const { 
    settlements,
    showSettlements,
    hasUnsettledBalances,
    allSettled,
    handleSettleUp,
    markAsSettled,
    hideSettlements
  } = useSettlements(balances);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Settlement Actions</span>
          {!showSettlements && (
            <Button 
              onClick={handleSettleUp} 
              disabled={!hasUnsettledBalances}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Settle Up
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Settlement Status Display */}
        <SettlementStatus 
          allSettled={allSettled}
          hasUnsettledBalances={hasUnsettledBalances}
        />
        
        {/* Show Settlements Display */}
        {!showSettlements && !hasUnsettledBalances ? null : !showSettlements ? (
          <p className="text-center text-muted-foreground py-4">
            Click "Settle Up" to see suggested payments.
          </p>
        ) : settlements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No settlement suggestions available.
          </p>
        ) : (
          <div className="space-y-4">
            {/* User's Settlements Section */}
            {settlements.some(s => s.fromUserId === user?.id || s.toUserId === user?.id) && (
              <div className="mb-4 pb-4 border-b">
                <SettlementList
                  settlements={settlements}
                  onMarkAsSettled={markAsSettled}
                  showUserSettlementsOnly={true}
                />
              </div>
            )}
            
            {/* All Settlements Section */}
            <h3 className="font-medium text-sm mb-3 text-muted-foreground">All settlements</h3>
            <SettlementList
              settlements={settlements}
              onMarkAsSettled={markAsSettled}
            />
            
            {/* Hide Settlements Button */}
            {showSettlements && !allSettled && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={hideSettlements}>
                  Hide Settlements
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
