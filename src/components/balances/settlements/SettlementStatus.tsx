
import React from 'react';
import { Check } from "lucide-react";

interface SettlementStatusProps {
  allSettled: boolean;
  hasUnsettledBalances: boolean;
}

export const SettlementStatus = ({ allSettled, hasUnsettledBalances }: SettlementStatusProps) => {
  if (!hasUnsettledBalances) {
    return (
      <div className="py-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full mb-2">
          <Check className="h-4 w-4" />
          <span className="font-medium">All settled up!</span>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          No payments needed. Everyone in the group is balanced.
        </p>
      </div>
    );
  }
  
  if (allSettled) {
    return (
      <div className="py-3 text-center bg-green-50 dark:bg-green-900/20 rounded-md mb-4">
        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
        <p className="text-green-600 dark:text-green-400 font-medium">All payments have been settled!</p>
      </div>
    );
  }
  
  return null;
};
