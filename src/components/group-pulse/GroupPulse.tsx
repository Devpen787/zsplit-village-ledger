
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PendingPayoutRequestsList } from './PendingPayoutRequestsList';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { BarChart, CheckCircle, Clock, CreditCard, Users, Wallet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const GroupPulse = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
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
    connectedWalletsCount,
    totalMembersCount,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin
  } = useGroupPulse(groupId);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Group Financial Pulse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              View group financial activity and statistics. Connect a wallet for additional features like submitting or approving payouts.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <WalletInfo 
                showLabel={true} 
                showMessage={true} 
                labelPrefix="Wallet: " 
                showConnectingState={false}
                connectMessage="Connect your wallet to submit payout requests or receive reimbursements."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial metrics shown to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pot Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${potBalance.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Available for group expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Expenses Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Paid: ${loading ? '...' : ((potBalance * 0.8).toFixed(2))}</span>
              <span>Unpaid: ${loading ? '...' : ((potBalance * 0.2).toFixed(2))}</span>
            </div>
            <Progress value={80} />
            <p className="text-sm text-muted-foreground">
              80% of expenses settled
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Pot Health and Activity metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Pot Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Payout</p>
                <p className="text-2xl font-medium">${averagePayoutSize.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payouts Remaining</p>
                <p className="text-2xl font-medium">{estimatedPayoutsRemaining.toFixed(1)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on current pot balance and average payout history
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Recent Expenses</p>
                <p className="text-2xl font-medium">{recentExpensesCount}</p>
                <p className="text-xs text-muted-foreground">in the last 7 days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Expense</p>
                <p className="text-lg font-medium">
                  {latestExpenseDate ? formatDistanceToNow(latestExpenseDate, { addSuffix: true }) : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Group connectivity status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{connectedWalletsCount} of {totalMembersCount} members</p>
                  <p className="text-sm text-muted-foreground">have connected wallets</p>
                </div>
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">Zulink</p>
                  <p className="text-sm text-muted-foreground">VPN status</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Payout Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{pendingPayoutsCount} pending requests</p>
                  <p className="text-sm text-muted-foreground">awaiting approval</p>
                </div>
                <div>
                  <p className="text-lg font-medium text-right">{averageApprovalTime}</p>
                  <p className="text-sm text-muted-foreground">average approval time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending payout requests list - shown to all but actions only for admins */}
      <div className="grid gap-6">
        {pendingRequests && pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingPayoutRequestsList
                pendingRequests={pendingRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                isAdmin={isAdmin && isConnected}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
