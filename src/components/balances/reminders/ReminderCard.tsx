
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Send } from "lucide-react";
import { formatCurrency } from '@/utils/money';

interface ReminderData {
  userId: string;
  userName: string;
  amount: number;
  lastReminder?: Date;
}

interface ReminderCardProps {
  reminder: ReminderData;
  canSendReminder: boolean;
  onSendReminder: (reminder: ReminderData) => void;
}

export const ReminderCard = ({ reminder, canSendReminder, onSendReminder }: ReminderCardProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{reminder.userName}</span>
            <Badge variant="destructive">
              owes {formatCurrency(reminder.amount)}
            </Badge>
          </div>
          {reminder.lastReminder && (
            <p className="text-xs text-muted-foreground">
              Last reminded: {reminder.lastReminder.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!canSendReminder ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recently reminded
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendReminder(reminder)}
            className="flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            Send Reminder
          </Button>
        )}
      </div>
    </div>
  );
};
