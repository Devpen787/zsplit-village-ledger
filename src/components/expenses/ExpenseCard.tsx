
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { getExpenseEmoji, formatDateForDisplay } from '@/utils/expenseUtils';
import { Expense } from '@/types/expenses';
import { useAuth } from '@/contexts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

interface ExpenseCardProps {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const { user } = useAuth();
  const isPayer = expense.paid_by === user?.id;
  
  // Query to get the current user's share of this expense
  const { data: userShare, isLoading: shareLoading } = useQuery({
    queryKey: ['expense-user-share', expense.id, user?.id],
    queryFn: async () => {
      if (!user?.id || isPayer) return null;
      
      const { data, error } = await supabase
        .from('expense_members')
        .select('share, paid_status')
        .eq('expense_id', expense.id)
        .eq('user_id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !isPayer,
  });
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get display name
  const getDisplayName = () => {
    if (!expense.paid_by_user) return 'Unknown';
    return expense.paid_by_user.name || expense.paid_by_user.email.split('@')[0];
  };

  // Format the date in a readable way
  const getFormattedDate = () => {
    try {
      return formatDistanceToNow(new Date(expense.date), { addSuffix: true });
    } catch (error) {
      return 'Date unknown';
    }
  };
  
  const displayName = getDisplayName();
  
  return (
    <Link to={`/expenses/${expense.id}`} key={expense.id}>
      <Card className="hover:bg-secondary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {getExpenseEmoji(expense.title)}
              </div>
              <div>
                <h4 className="font-medium">{expense.title}</h4>
                <div className="flex items-center text-sm space-x-2">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarFallback className="text-xs bg-primary/20">
                      {displayName ? getInitials(displayName) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={isPayer ? "text-green-600 font-medium" : "text-muted-foreground"}>
                    {isPayer ? 'You paid' : `${displayName} paid`}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{getFormattedDate()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">
                {Number(expense.amount).toFixed(2)} {expense.currency}
              </p>
              
              {!isPayer && (
                <div className="text-xs">
                  {shareLoading ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : userShare ? (
                    <span className={userShare.paid_status ? "text-green-600" : "text-amber-600 font-medium"}>
                      {userShare.paid_status ? "Paid" : `You owe ${Number(userShare.share).toFixed(2)}`}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
