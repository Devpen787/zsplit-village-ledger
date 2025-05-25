
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, CreditCard, ArrowRight, Undo2 } from "lucide-react";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentTrackerProps {
  settlements: Settlement[];
  onMarkAsSettled: (index: number) => void;
  onUndoSettlement: (index: number) => void;
}

export const PaymentTracker = ({ 
  settlements, 
  onMarkAsSettled, 
  onUndoSettlement 
}: PaymentTrackerProps) => {
  const { user } = useAuth();
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

  const userSettlements = settlements.filter(s => 
    s.fromUserId === user?.id || s.toUserId === user?.id
  );

  const pendingSettlements = userSettlements.filter(s => !s.settled);
  const completedSettlements = userSettlements.filter(s => s.settled);

  if (userSettlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No payments needed from you at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingSettlements.length > 0 && (
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
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(actualIndex)}
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
        )}

        {completedSettlements.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4" />
              Completed Payments ({completedSettlements.length})
            </h3>
            <div className="space-y-2">
              {completedSettlements.map((settlement, index) => {
                const actualIndex = settlements.findIndex(s => 
                  s.fromUserId === settlement.fromUserId && 
                  s.toUserId === settlement.toUserId &&
                  s.amount === settlement.amount
                );
                const isUserDebtor = settlement.fromUserId === user?.id;
                
                return (
                  <div 
                    key={`completed-${index}`}
                    className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                      <Badge variant="success">
                        {formatCurrency(settlement.amount)}
                      </Badge>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Undo2 className="h-3 w-3" />
                          Undo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Undo Settlement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to mark this payment as unpaid? 
                            This will move it back to pending status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUndoPayment(actualIndex)}>
                            Undo Settlement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
