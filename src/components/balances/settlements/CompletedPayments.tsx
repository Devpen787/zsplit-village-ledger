
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Undo2 } from "lucide-react";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
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

interface CompletedPaymentsProps {
  settlements: Settlement[];
  onUndoPayment: (index: number) => void;
}

export const CompletedPayments = ({ 
  settlements, 
  onUndoPayment 
}: CompletedPaymentsProps) => {
  const { user } = useAuth();

  const userSettlements = settlements.filter(s => 
    s.fromUserId === user?.id || s.toUserId === user?.id
  );
  const completedSettlements = userSettlements.filter(s => s.settled);

  if (completedSettlements.length === 0) {
    return null;
  }

  return (
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
                    <AlertDialogAction onClick={() => onUndoPayment(actualIndex)}>
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
  );
};
