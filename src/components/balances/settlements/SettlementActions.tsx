
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, HelpCircle } from "lucide-react";
import { BalanceData } from '../BalancesTable';
import { useAuth } from '@/contexts';
import { SettlementStatus } from './SettlementStatus';
import { SettlementList } from './SettlementList';
import { useSettlements } from '@/hooks/useSettlements';
import { toast } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    undoSettlement,
    hideSettlements,
    setShowSettlements
  } = useSettlements(balances);
  
  // Automatically show settlements if there are unbalanced accounts
  useEffect(() => {
    if (hasUnsettledBalances) {
      setShowSettlements(true);
    }
  }, [hasUnsettledBalances, setShowSettlements]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Settlement Actions</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="w-80 p-2">
                  <p className="text-sm">
                    This section shows suggested payments that will help balance everyone's accounts. 
                    Users with negative balances should pay users with positive balances 
                    to settle all debts efficiently.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!showSettlements && hasUnsettledBalances && (
            <Button 
              onClick={handleSettleUp} 
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
        {!hasUnsettledBalances ? null : !showSettlements ? (
          <p className="text-center text-muted-foreground py-4">
            Calculating suggested payments...
          </p>
        ) : settlements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Everyone is settled up – no payments needed.
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
            {showSettlements && !allSettled && hasUnsettledBalances && settlements.length > 0 && (
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
