
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { ReminderCard } from './reminders/ReminderCard';
import { ReminderDialog } from './reminders/ReminderDialog';
import { useReminders } from '@/hooks/useReminders';

interface ReminderSystemProps {
  balances: BalanceData[];
}

export const ReminderSystem = ({ balances }: ReminderSystemProps) => {
  const {
    peopleWhoOweMe,
    selectedReminder,
    customMessage,
    setCustomMessage,
    canSendReminder,
    handleSendReminder,
    openDialog,
    closeDialog
  } = useReminders(balances);

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
            <ReminderCard
              key={`reminder-${index}`}
              reminder={reminder}
              canSendReminder={canSendReminder(reminder)}
              onSendReminder={openDialog}
            />
          ))}
        </div>
        
        <ReminderDialog
          reminder={selectedReminder}
          customMessage={customMessage}
          onCustomMessageChange={setCustomMessage}
          onSendReminder={handleSendReminder}
          onClose={closeDialog}
        />
      </CardContent>
    </Card>
  );
};
