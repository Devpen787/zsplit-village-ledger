
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Settlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts';
import { PendingPayments } from './PendingPayments';
import { CompletedPayments } from './CompletedPayments';
import { usePaymentTracker } from '@/hooks/usePaymentTracker';

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
  const { payingIndex, handleMarkAsPaid, handleUndoPayment } = usePaymentTracker(
    onMarkAsSettled, 
    onUndoSettlement
  );

  const userSettlements = settlements.filter(s => 
    s.fromUserId === user?.id || s.toUserId === user?.id
  );

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
        <PendingPayments
          settlements={settlements}
          onMarkAsPaid={handleMarkAsPaid}
          payingIndex={payingIndex}
        />
        <CompletedPayments
          settlements={settlements}
          onUndoPayment={handleUndoPayment}
        />
      </CardContent>
    </Card>
  );
};
