import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import { DebtRelationship } from './useDebtRelationships';
import { formatCurrency } from '@/utils/money';

interface DebtRelationshipCardProps {
  relationship: DebtRelationship;
  variant: 'user-creditor' | 'user-debtor' | 'other';
  onSendReminder?: (relationship: DebtRelationship) => void;
}

export const DebtRelationshipCard = ({ 
  relationship, 
  variant, 
  onSendReminder 
}: DebtRelationshipCardProps) => {
  const handleSendReminder = () => {
    if (onSendReminder) {
      onSendReminder(relationship);
    }
  };

  if (variant === 'user-creditor') {
    return (
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {relationship.debtorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{relationship.debtorName}</p>
            <p className="text-sm text-muted-foreground">owes you</p>
          </div>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            {formatCurrency(relationship.amount)}
          </Badge>
        </div>
        {onSendReminder && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendReminder}
            className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50"
          >
            <Bell className="h-3 w-3" />
            Send Reminder
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'user-debtor') {
    return (
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {relationship.creditorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{relationship.creditorName}</p>
            <p className="text-sm text-muted-foreground">you owe them</p>
          </div>
          <Badge variant="destructive">
            {formatCurrency(relationship.amount)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Time to settle up! 💸
        </div>
      </div>
    );
  }

  // Other relationships
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
      <div className="flex items-center gap-2">
        <span className="font-medium">{relationship.debtorName}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{relationship.creditorName}</span>
        <Badge variant="outline">
          {formatCurrency(relationship.amount)}
        </Badge>
      </div>
    </div>
  );
};
