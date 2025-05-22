
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { BalanceData } from './BalancesTable';
import { useAuth } from '@/contexts';

type Settlement = {
  fromUserId: string;
  fromUserName: string | null;
  toUserId: string;
  toUserName: string | null;
  amount: number;
  settled?: boolean;
};

interface SettlementActionsProps {
  balances: BalanceData[];
}

export const SettlementActions = ({ balances }: SettlementActionsProps) => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showSettlements, setShowSettlements] = useState(false);
  
  // Calculate if there are any unsettled balances
  const hasUnsettledBalances = balances.some(balance => 
    Math.abs(balance.netBalance) > 0.01
  );
  
  // Calculate optimal settlements
  const calculateSettlements = () => {
    // Filter users who owe money and users who are owed money
    const debtors = balances
      .filter(balance => balance.netBalance < -0.01) // Small threshold to handle floating point errors
      .sort((a, b) => a.netBalance - b.netBalance); // Sort from largest debt to smallest
    
    const creditors = balances
      .filter(balance => balance.netBalance > 0.01) // Small threshold to handle floating point errors
      .sort((a, b) => b.netBalance - a.netBalance); // Sort from largest credit to smallest

    // Calculate the optimal payments to settle balances
    const payments: Settlement[] = [];
    
    // Create clones to work with
    const remainingDebtors = [...debtors];
    const remainingCreditors = [...creditors];
    
    while (remainingDebtors.length > 0 && remainingCreditors.length > 0) {
      const debtor = remainingDebtors[0];
      const creditor = remainingCreditors[0];
      
      // How much the debtor owes (make it positive for easier comparison)
      const debtAmount = Math.abs(debtor.netBalance);
      // How much the creditor is owed
      const creditAmount = creditor.netBalance;
      
      // The payment is the minimum of what's owed and what's due
      const paymentAmount = Math.min(debtAmount, creditAmount);
      
      if (paymentAmount > 0.01) { // Ignore tiny payments
        payments.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Number(paymentAmount.toFixed(2)),
          settled: false
        });
      }
      
      // Update balances
      debtor.netBalance += paymentAmount;
      creditor.netBalance -= paymentAmount;
      
      // Remove users who have settled up
      if (Math.abs(debtor.netBalance) < 0.01) {
        remainingDebtors.shift();
      }
      
      if (Math.abs(creditor.netBalance) < 0.01) {
        remainingCreditors.shift();
      }
    }
    
    setSettlements(payments);
    setShowSettlements(true);
  };
  
  const handleSettleUp = () => {
    calculateSettlements();
  };
  
  const markAsSettled = (index: number) => {
    setSettlements(prev => 
      prev.map((settlement, i) => 
        i === index ? { ...settlement, settled: true } : settlement
      )
    );
    
    toast.success("Payment marked as settled!");
  };
  
  // Check if all suggested payments are marked as settled
  const allSettled = settlements.length > 0 && settlements.every(s => s.settled);
  
  // Check if current user is involved in any settlements
  const userSettlements = settlements.filter(s => 
    s.fromUserId === user?.id || s.toUserId === user?.id
  );
  
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
        {!hasUnsettledBalances ? (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full mb-2">
              <Check className="h-4 w-4" />
              <span className="font-medium">All settled up!</span>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Everyone in the group is balanced. No payments needed.
            </p>
          </div>
        ) : !showSettlements ? (
          <p className="text-center text-muted-foreground py-4">
            Click "Settle Up" to see suggested payments.
          </p>
        ) : settlements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No settlement suggestions available.
          </p>
        ) : (
          <div className="space-y-4">
            {allSettled && (
              <div className="py-3 text-center bg-green-50 dark:bg-green-900/20 rounded-md mb-4">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-green-600 dark:text-green-400 font-medium">All payments settled!</p>
              </div>
            )}
            
            {userSettlements.length > 0 && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-medium text-sm mb-3 text-muted-foreground">Your settlements</h3>
                {userSettlements.map((settlement, index) => {
                  const isDebtor = settlement.fromUserId === user?.id;
                  const mainUser = isDebtor ? settlement.toUserName : settlement.fromUserName;
                  
                  return (
                    <div key={`user-${index}`} className="flex items-center justify-between p-3 bg-primary/5 rounded-md mb-2">
                      <div className="flex items-center gap-2">
                        {isDebtor ? (
                          <>
                            <span className="font-medium">You</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{mainUser}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{mainUser}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">You</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">{settlement.amount.toFixed(2)} CHF</span>
                        {!settlement.settled && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => markAsSettled(settlements.findIndex(s => 
                              s.fromUserId === settlement.fromUserId && 
                              s.toUserId === settlement.toUserId &&
                              s.amount === settlement.amount
                            ))}
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
            )}
            
            <h3 className="font-medium text-sm mb-3 text-muted-foreground">All settlements</h3>
            {settlements.map((settlement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{settlement.fromUserName}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{settlement.toUserName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold">{settlement.amount.toFixed(2)} CHF</span>
                  {!settlement.settled && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => markAsSettled(index)}
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
            ))}
            
            {showSettlements && !allSettled && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setShowSettlements(false)}>
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
