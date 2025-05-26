
import React from 'react';
import { Settlement } from '@/hooks/useSettlements';
import { formatCurrency } from '@/utils/money';

interface PaymentSummaryCardProps {
  settlement: Settlement;
}

export const PaymentSummaryCard = ({ settlement }: PaymentSummaryCardProps) => {
  return (
    <div className="p-4 bg-secondary/10 rounded-lg">
      <div className="flex justify-between items-center text-sm">
        <span>Payment from:</span>
        <span className="font-medium">{settlement.fromUserName}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Payment to:</span>
        <span className="font-medium">{settlement.toUserName}</span>
      </div>
      <div className="flex justify-between items-center text-sm font-bold border-t pt-2 mt-2">
        <span>Amount:</span>
        <span className="text-lg">{formatCurrency(settlement.amount)}</span>
      </div>
    </div>
  );
};
