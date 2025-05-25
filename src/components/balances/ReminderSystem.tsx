
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Clock, Users } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReminderSystemProps {
  balances: BalanceData[];
}

interface ReminderData {
  userId: string;
  userName: string;
  amount: number;
  lastReminder?: Date;
}

export const ReminderSystem = ({ balances }: ReminderSystemProps) => {
  const { user } = useAuth();
  const [selectedReminder, setSelectedReminder] = useState<ReminderData | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sentReminders, setSentReminders] = useState<Record<string, Date>>({});

  // Find people who owe the current user money
  const peopleWhoOweMe = React.useMemo(() => {
    if (!user) return [];
    
    return balances
      .filter(balance => balance.netBalance < -0.01) // People who owe money
      .map(debtor => ({
        userId: debtor.userId,
        userName: debtor.userName || 'Unknown',
        amount: Math.abs(debtor.netBalance),
        lastReminder: sentReminders[debtor.userId]
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [balances, user, sentReminders]);

  const handleSendReminder = async (reminder: ReminderData, message?: string) => {
    try {
      // In a real app, this would send an actual notification/email
      console.log('Sending reminder to:', reminder.userName, message);
      
      // Update sent reminders tracking
      setSentReminders(prev => ({
        ...prev,
        [reminder.userId]: new Date()
      }));
      
      toast.success(`Reminder sent to ${reminder.userName}!`);
      setSelectedReminder(null);
      setCustomMessage('');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const getDefaultMessage = (reminder: ReminderData) => {
    return `Hi ${reminder.userName},\n\nJust a friendly reminder that you have an outstanding balance of ${formatCurrency(reminder.amount)}. No rush, but please settle when convenient.\n\nThanks!`;
  };

  const canSendReminder = (reminder: ReminderData) => {
    if (!reminder.lastReminder) return true;
    
    // Can send reminder if last one was more than 24 hours ago
    const timeSinceLastReminder = Date.now() - reminder.lastReminder.getTime();
    return timeSinceLastReminder > 24 * 60 * 60 * 1000;
  };

  if (peopleWhoOweMe.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No one owes you money at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Payment Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {peopleWhoOweMe.map((reminder, index) => (
            <div 
              key={`reminder-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
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
                {!canSendReminder(reminder) ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recently reminded
                  </Badge>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReminder(reminder);
                          setCustomMessage(getDefaultMessage(reminder));
                        }}
                        className="flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        Send Reminder
                      </Button>
                    </DialogTrigger>
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
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Enter your reminder message..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedReminder(null);
                            setCustomMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSendReminder(reminder, customMessage)}
                          className="flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Send Reminder
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
