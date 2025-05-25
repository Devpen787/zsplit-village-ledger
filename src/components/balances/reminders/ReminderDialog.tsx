
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { formatCurrency } from '@/utils/money';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReminderData {
  userId: string;
  userName: string;
  amount: number;
  lastReminder?: Date;
}

interface ReminderDialogProps {
  reminder: ReminderData | null;
  customMessage: string;
  onCustomMessageChange: (message: string) => void;
  onSendReminder: (reminder: ReminderData, message?: string) => void;
  onClose: () => void;
}

export const ReminderDialog = ({ 
  reminder, 
  customMessage, 
  onCustomMessageChange, 
  onSendReminder, 
  onClose 
}: ReminderDialogProps) => {
  if (!reminder) return null;

  return (
    <Dialog open={!!reminder} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Send a friendly reminder to {reminder.userName} about their outstanding balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
            <span>Amount owed:</span>
            <Badge variant="destructive">
              {formatCurrency(reminder.amount)}
            </Badge>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea
              value={customMessage}
              onChange={(e) => onCustomMessageChange(e.target.value)}
              placeholder="Enter your reminder message..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSendReminder(reminder, customMessage)}
            className="flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            Send Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
