
import { useState, useMemo } from 'react';
import { BalanceData } from '@/components/balances/BalancesTable';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { toast } from '@/components/ui/sonner';

interface ReminderData {
  userId: string;
  userName: string;
  amount: number;
  lastReminder?: Date;
}

export const useReminders = (balances: BalanceData[]) => {
  const { user } = useAuth();
  const [sentReminders, setSentReminders] = useState<Record<string, Date>>({});
  const [selectedReminder, setSelectedReminder] = useState<ReminderData | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  // Find people who owe the current user money
  const peopleWhoOweMe = useMemo(() => {
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

  const getDefaultMessage = (reminder: ReminderData) => {
    return `Hi ${reminder.userName},\n\nJust a friendly reminder that you have an outstanding balance of ${formatCurrency(reminder.amount)}. No rush, but please settle when convenient.\n\nThanks!`;
  };

  const canSendReminder = (reminder: ReminderData) => {
    if (!reminder.lastReminder) return true;
    
    // Can send reminder if last one was more than 24 hours ago
    const timeSinceLastReminder = Date.now() - reminder.lastReminder.getTime();
    return timeSinceLastReminder > 24 * 60 * 60 * 1000;
  };

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
      closeDialog();
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const openDialog = (reminder: ReminderData) => {
    setSelectedReminder(reminder);
    setCustomMessage(getDefaultMessage(reminder));
  };

  const closeDialog = () => {
    setSelectedReminder(null);
    setCustomMessage('');
  };

  return {
    peopleWhoOweMe,
    selectedReminder,
    customMessage,
    setCustomMessage,
    canSendReminder,
    handleSendReminder,
    openDialog,
    closeDialog
  };
};
