
import React from 'react';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PendingPayoutRequestsList } from './PendingPayoutRequestsList';

interface GroupPulseProps {
  groupId: string;
}

export const GroupPulse: React.FC<GroupPulseProps> = ({ groupId }) => {
  const { 
    loading,
    potBalance, 
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest
  } = useGroupPulse(groupId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Pot Health */}
      <section>
        <h2 className="text-lg font-medium mb-3">Pot Health</h2>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Current Pot Balance</div>
                <div className="text-2xl font-bold">${potBalance.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Average Payout Size</div>
                <div className="text-xl">${averagePayoutSize.toFixed(2)}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                {estimatedPayoutsRemaining > 0 ? (
                  <p>Pot can cover approximately <span className="font-medium">{estimatedPayoutsRemaining}</span> more payouts at current average.</p>
                ) : (
                  <p>Add funds to the pot to support future payouts.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Expense Activity */}
      <section>
        <h2 className="text-lg font-medium mb-3">Expense Activity</h2>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Expenses in Last 7 Days</div>
                  <div className="text-2xl font-bold">{recentExpensesCount}</div>
                </div>
                <TrendingUp className="text-primary h-8 w-8" />
              </div>
              
              {latestExpenseDate ? (
                <div>
                  <div className="text-sm text-muted-foreground">Most Recent Expense</div>
                  <div className="text-xl">{formatDistanceToNow(latestExpenseDate, { addSuffix: true })}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No expenses recorded yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Pending Payout Requests */}
      <section>
        <h2 className="text-lg font-medium mb-3">Pending Payout Requests</h2>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                  <div className="text-2xl font-bold">{pendingPayoutsCount}</div>
                </div>
                {pendingPayoutsCount > 0 && (
                  <AlertCircle className="text-amber-500 h-8 w-8" />
                )}
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Average Time to Approve</div>
                <div className="text-xl">{averageApprovalTime}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                {pendingPayoutsCount > 0 ? (
                  <p>{pendingPayoutsCount} {pendingPayoutsCount === 1 ? 'request' : 'requests'} waiting – smooth coordination helps!</p>
                ) : (
                  <p>No pending requests – the group is all caught up!</p>
                )}
              </div>
              
              {/* Admin-only: Show list of pending requests with approval/rejection buttons */}
              {isAdmin && pendingPayoutsCount > 0 && (
                <PendingPayoutRequestsList 
                  pendingRequests={pendingRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
